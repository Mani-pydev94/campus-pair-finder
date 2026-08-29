// src/lib/matching.ts
//
// Pure, deterministic compatibility-matching engine for Campus Connect AI.
//
// Every function here is a pure function of its inputs — there is no Math.random(),
// no Date.now(), no I/O. This makes the scoring reproducible: the same pair of
// response sets always yields the same compatibility score.
//
// Scoring model
// ──────────────
//   1.  Question-level agreement: ordinal distance on a 5-point Likert scale
//         Strongly Agree → Strongly Disagree   (index 0 → 4)
//       score = 100 - 25 * |a - b|
//       Same answer = 100, adjacent = 75, 2 apart = 50, 3 apart = 25, opposite = 0.
//
//   2.  Category compatibility: the average of question-level scores within a
//       category, weighted by importance.  Importance tiers:
//         "Very Important"   → 1.5
//         "Somewhat Important" → 1.0
//         "Not Important"    → 0.5
//
//   3.  Interest / skill similarity: Jaccard similarity of the two users'
//       interests and skills arrays, scaled to 0–100.
//
//   4.  Overall compatibility score: a weighted blend
//         55 % questionnaire (category scores)
//         30 % interest / skill Jaccard
//         15 % answer-count overlap (answered-question coverage)
//
// Threshold below which a pair is NOT shown as a "compatible" match.
export const MIN_COMPATIBILITY_SCORE = 75;

// ── Canonical 5-point answer scale (ordered) ───────────────────────────
export const ANSWER_SCALE = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
] as const;

export type AnswerValue = (typeof ANSWER_SCALE)[number];

// Importance weighting tiers
const IMPORTANCE_WEIGHTS: Record<string, number> = {
  "Very Important": 1.5,
  "Somewhat Important": 1.0,
  "Not Important": 0.5,
};

// ── Types ──────────────────────────────────────────────────────────────

export interface UserResponse {
  user_id: string;
  category: string;
  question_id: string; // legacy numeric-suffix text (kept for back-compat)
  question_uuid: string | null;
  answer: string;
  importance: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  academic_profiles?: {
    university: string | null;
    degree: string | null;
    field_of_study: string | null;
    skills: string[] | null;
    interests: string[] | null;
    year_of_study: string | null;
  } | null;
}

export interface CompatibilityResult {
  score: number;
  categoryScores: Record<string, number>;
  matchedQuestionCount: number;
  totalQuestionCount: number;
  interestOverlap: number;
  insight: string;
  reasons: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Returns the ordinal index of an answer on the canonical 5-point scale.
 * Falls back to a case-insensitive substring search, and finally returns 2
 * (Neutral) when the answer is not recognised — this keeps the engine robust
 * against free-text or legacy answer values without inflating scores.
 */
function answerOrdinal(answer: string): number {
  const idx = ANSWER_SCALE.indexOf(answer as AnswerValue);
  if (idx >= 0) return idx;

  // Fallback: case-insensitive match
  const lower = answer.toLowerCase();
  for (let i = 0; i < ANSWER_SCALE.length; i++) {
    const opt = ANSWER_SCALE[i];
    if (opt && opt.toLowerCase() === lower) return i;
  }

  // Substring fallback (handles "agree", "disagree", etc.)
  for (let i = 0; i < ANSWER_SCALE.length; i++) {
    const opt = ANSWER_SCALE[i];
    if (opt && lower.includes(opt.toLowerCase())) return i;
  }

  return 2; // Neutral default
}

/**
 * Map a question UUID to a human-readable label for the "reasons" array.
 * Uses the category + question_id (numeric suffix) from the canonical question.
 */
function questionLabel(
  questionId: string,
  category: string,
  questions: QuestionMeta[],
): string | undefined {
  // Try to find by question_uuid first, then by category + numeric question_id
  const q = questions.find(
    (q) => q.id === questionId,
  ) ?? questions.find(
    (q) => q.category === category && q.externalIdNum === Number(questionId),
  );
  return q ? q.questionText : undefined;
}

export interface QuestionMeta {
  id: string; // UUID of questionnaire_questions.id
  externalId: string; // e.g. "v1", "p2"
  externalIdNum: number; // e.g. 1, 2
  category: string; // category name, e.g. "Values"
  categoryOrder: number; // display_order of the category
  questionText: string;
  options: string[];
  displayOrder: number;
}

// ── Core scoring functions ─────────────────────────────────────────────

/**
 * Score a single pair of answers based on ordinal distance.
 * Same answer = 100, each step apart loses 25 points.
 */
export function scoreAnswerPair(answerA: string, answerB: string): number {
  const a = answerOrdinal(answerA);
  const b = answerOrdinal(answerB);
  const distance = Math.abs(a - b);
  return Math.max(0, 100 - distance * 25);
}

/**
 * Compute the importance weight for a response.
 */
function importanceWeight(importance: string): number {
  const w = IMPORTANCE_WEIGHTS[importance];
  if (w !== undefined) return w;
  const fallback = IMPORTANCE_WEIGHTS["Somewhat Important"];
  return fallback !== undefined ? fallback : 1.0;
}

/**
 * Compute compatibility between two users' response sets.
 *
 * @param responsesA  - all responses for user A
 * @param responsesB  - all responses for user B
 * @param questions   - canonical question metadata (for labelling reasons)
 * @returns category scores, matched counts, and an insight string
 */
export function computeResponseCompatibility(
  responsesA: UserResponse[],
  responsesB: UserResponse[],
  questions?: QuestionMeta[],
): {
  categoryScores: Record<string, number>;
  matchedQuestionCount: number;
  totalQuestionCount: number;
  topSimilarities: string[];
} {
  // Index responses B by (category, question_id) for fast lookup
  const indexB = new Map<string, UserResponse>();
  for (const r of responsesB) {
    indexB.set(`${r.category}::${r.question_id}`, r);
  }

  // Also index by question_uuid if available
  const indexBUuid = new Map<string, UserResponse>();
  for (const r of responsesB) {
    if (r.question_uuid) {
      indexBUuid.set(r.question_uuid, r);
    }
  }

  const categoryScores: Record<string, number> = {};
  const categoryWeights: Record<string, number> = {};
  const similarities: Array<{
    category: string;
    questionId: string;
    questionText?: string;
    score: number;
  }> = [];

  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const respA of responsesA) {
    const key = `${respA.category}::${respA.question_id}`;
    const respB = indexB.get(key) ?? indexBUuid.get(respA.question_uuid ?? "");

    if (!respB) {
      // User B hasn't answered this question — skip for scoring
      continue;
    }

    const answerScore = scoreAnswerPair(respA.answer, respB.answer);
    const imp = importanceWeight(respA.importance);

    const catScore = answerScore * imp;
    totalWeightedScore += catScore;
    totalWeight += imp;

    const catTotal = categoryScores[respA.category] ?? 0;
    const catWeight = categoryWeights[respA.category] ?? 0;
    categoryScores[respA.category] = catTotal + catScore;
    categoryWeights[respA.category] = catWeight + imp;

    similarities.push({
      category: respA.category,
      questionId: respA.question_id,
      score: answerScore,
    });
  }

  // Average each category score by its weight
  for (const cat of Object.keys(categoryScores)) {
    const w = categoryWeights[cat] ?? 0;
    const score = categoryScores[cat] ?? 0;
    if (w > 0) {
      categoryScores[cat] = Math.round(score / w);
    } else {
      categoryScores[cat] = 0;
    }
  }

  const matchedQuestionCount = similarities.length;
  const totalQuestionCount = responsesA.length;

  // Build "top similarities" list: questions where both users answered identically or adjacent
  const topSimilarities = similarities
    .filter((s) => s.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => {
      const label = questions
        ? questionLabel(s.questionId, s.category, questions)
        : undefined;
      return label
        ? `${s.category}: "${label.substring(0, 50)}"`
        : `${s.category} Q${s.questionId}`;
    });

  return {
    categoryScores,
    matchedQuestionCount,
    totalQuestionCount,
    topSimilarities,
  };
}

/**
 * Compute Jaccard similarity between two arrays of interests/skills.
 * Returns a value in [0, 1].
 */
export function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;

  const setA = new Set(a.map((s) => s.toLowerCase().trim()));
  const setB = new Set(b.map((s) => s.toLowerCase().trim()));

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;

  return intersection / union;
}

/**
 * Compute the overall compatibility score between two users.
 *
 * @param responsesA  - all responses for user A
 * @param responsesB  - all responses for user B
 * @param profileA    - profile of user A
 * @param profileB    - profile of user B
 * @param questions   - canonical question metadata (optional, for labelling)
 * @returns full compatibility result
 */
export function computeCompatibility(
  responsesA: UserResponse[],
  responsesB: UserResponse[],
  profileA: UserProfile,
  profileB: UserProfile,
  questions?: QuestionMeta[],
): CompatibilityResult {
  const resp = computeResponseCompatibility(responsesA, responsesB, questions);

  // Overall questionnaire score: average of category scores
  const categoryScores = resp.categoryScores;
  const categoryValues = Object.values(categoryScores);
  const questionnaireScore =
    categoryValues.length > 0
      ? categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length
      : 0;

  // Interest / skill similarity
  const interestsA = profileA.academic_profiles?.interests ?? [];
  const interestsB = profileB.academic_profiles?.interests ?? [];
  const skillsA = profileA.academic_profiles?.skills ?? [];
  const skillsB = profileB.academic_profiles?.skills ?? [];

  const interestSim = jaccardSimilarity(interestsA, interestsB);
  const skillSim = jaccardSimilarity(skillsA, skillsB);

  // Combine interest + skill similarity, weighted 70/30
  const combinedSim = interestSim * 0.7 + skillSim * 0.3;
  const interestScore = Math.round(combinedSim * 100);

  // Answer-count overlap factor: how much of A's answered questions did B also answer?
  const overlapFactor =
    resp.totalQuestionCount > 0
      ? resp.matchedQuestionCount / resp.totalQuestionCount
      : 0;

  // Final blended score
  const finalScore = Math.round(
    questionnaireScore * 0.55 +
      interestScore * 0.30 +
      overlapFactor * 100 * 0.15,
  );

  // Build reasons list
  const reasons: string[] = [];

  if (finalScore >= 90) {
    reasons.push("Excellent Values & Personality Match");
  } else if (finalScore >= 80) {
    reasons.push("Strong Compatibility Match");
  } else if (finalScore >= 75) {
    reasons.push("Good Compatibility Match");
  }

  // Add specific category highlights
  const sortedCats = Object.entries(categoryScores).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  const topCatEntry = sortedCats.length > 0 ? sortedCats[0] : undefined;
  const topCatScore = topCatEntry ? (topCatEntry[1] ?? 0) : 0;
  if (topCatScore >= 80) {
    reasons.push(`${topCatEntry![0]} Alignment`);
  }

  if (interestScore >= 50) {
    const sharedCount = Math.min(
      new Set(interestsA.map((s) => s.toLowerCase())).size,
      new Set(interestsB.map((s) => s.toLowerCase())).size,
    );
    reasons.push(`Shared Interests (${Math.round(combinedSim * 100)}% overlap)`);
  } else if (skillSim >= 0.3) {
    reasons.push("Complementary Skills");
  }

  if (resp.matchedQuestionCount >= 10) {
    reasons.push("Deep Profile Compatibility");
  }

  // Build insight text
  const topCategory = sortedCats[0]?.[0] ?? "Compatibility";
  let insight: string;

  if (finalScore >= 85) {
    insight = `You share strong alignment in ${topCategory.toLowerCase()} and complementary interests.`;
  } else if (finalScore >= 75) {
    insight = `Your ${topCategory.toLowerCase()} perspectives align well with shared interests.`;
  } else {
    insight = `You have moderate compatibility with opportunities to connect.`;
  }

  return {
    score: finalScore,
    categoryScores,
    matchedQuestionCount: resp.matchedQuestionCount,
    totalQuestionCount: resp.totalQuestionCount,
    interestOverlap: interestScore,
    insight,
    reasons: reasons.length > 0 ? reasons : ["Potential Match"],
  };
}

/**
 * Compute compatibility for a list of candidate profiles against a target user.
 *
 * @param targetUserId   - the user requesting matches
 * @param targetResponses - that user's responses
 * @param targetProfile  - that user's profile
 * @param candidates     - array of { userId, responses, profile } for each candidate
 * @param questions      - canonical question metadata (optional)
 * @returns array of { userId, profile, compatibility } sorted by score descending,
 *          filtered to scores >= MIN_COMPATIBILITY_SCORE
 */
export function findCompatibleMatches(
  targetUserId: string,
  targetResponses: UserResponse[],
  targetProfile: UserProfile,
  candidates: Array<{
    userId: string;
    responses: UserResponse[];
    profile: UserProfile;
  }>,
  questions?: QuestionMeta[],
): Array<{
  userId: string;
  profile: UserProfile;
  compatibility: CompatibilityResult;
}> {
  const results: Array<{
    userId: string;
    profile: UserProfile;
    compatibility: CompatibilityResult;
  }> = [];

  for (const candidate of candidates) {
    // Skip self
    if (candidate.userId === targetUserId) continue;

    const compat = computeCompatibility(
      targetResponses,
      candidate.responses,
      targetProfile,
      candidate.profile,
      questions,
    );

    // Only include matches at or above the threshold
    if (compat.score >= MIN_COMPATIBILITY_SCORE) {
      results.push({
        userId: candidate.userId,
        profile: candidate.profile,
        compatibility: compat,
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.compatibility.score - a.compatibility.score);

  return results;
}
