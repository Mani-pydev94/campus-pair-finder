// src/components/profile/ProfileEducationForm.tsx

import React from 'react';
import { UNIVERSITIES, FIELDS_OF_STUDY } from '../../constants/profileData'; // Line 4: Add import

export const ProfileEducationForm = ({ formData, setFormData }) => {
  
  // Line 12: Handlers to update state without losing input focus
  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-4">
      {/* --- UNIVERSITY DROPDOWN --- */}
      {/* Line 24: Add University Select Block */}
      <div className="form-group">
        <label htmlFor="university-select" className="block text-sm font-medium">
          University / Institution
        </label>
        <select
          id="university-select"
          value={formData.university || ''}
          onChange={(e) => handleSelectChange('university', e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
        >
          <option value="">Select a University</option>
          {UNIVERSITIES.map((uni) => (
            <option key={uni} value={uni}>
              {uni}
            </option>
          ))}
        </select>
      </div>

      {/* --- FIELD OF STUDY DROPDOWN --- */}
      {/* Line 45: Add Field of Study Select Block */}
      <div className="form-group">
        <label htmlFor="field-of-study-select" className="block text-sm font-medium">
          Field of Study
        </label>
        <select
          id="field-of-study-select"
          value={formData.fieldOfStudy || ''}
          onChange={(e) => handleSelectChange('fieldOfStudy', e.target.value)}
          className="mt-1 block w-full rounded-md border p-2"
        >
          <option value="">Select a Field of Study</option>
          {FIELDS_OF_STUDY.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};