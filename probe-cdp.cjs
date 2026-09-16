const { spawn } = require('child_process');
const { WebSocket } = require('ws');
const fs = require('fs');

const PORT = 8083;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = `http://localhost:${PORT}/probe-debug`;

let ws, msgId = 0;
const pending = new Map();
function send(method, params) {
  const id = ++msgId;
  return new Promise((res) => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params: params || {} })); });
}
const logs = [];
function wait(ms){return new Promise(r=>setTimeout(r,ms));}

(async () => {
  const chrome = spawn(CHROME, [
    '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
    '--remote-debugging-port=9222','--user-data-dir=' + fs.mkdtempSync(process.env.TEMP + '/cdp-'),
    URL,
  ], { stdio: 'ignore' });
  await wait(3000);

  const t = (await fetch('http://localhost:9222/json').then(r=>r.json())).find(x=>x.type==='page' && x.url.includes('probe-debug')) || (await fetch('http://localhost:9222/json').then(r=>r.json()))[0];
  const wsUrl = t.webSocketDebuggerUrl;
  ws = new WebSocket(wsUrl);

  await new Promise((resolve) => {
    ws.on('open', resolve);
    ws.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
      else if (m.method === 'Runtime.consoleAPICalled') {
        const text = (m.params.args||[]).map(a=>a.value!==undefined?a.value:(a.description||'')).join(' ');
        logs.push('CONSOLE: ' + text);
      }
      else if (m.method === 'Runtime.exceptionThrown') {
        logs.push('EXCEPTION: ' + (m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text));
      }
      else if (m.method === 'Log.entryAdded') {
        logs.push('LOG[' + (m.params.entry?.level||'') + ']: ' + (m.params.entry?.text||''));
      }
    });
  });

  await wait(400);
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Page.enable');
  ws.on('message', () => {}); // already handled above

  const nav = await send('Page.navigate', { url: URL }).catch(()=>({}));
  console.log('NAV (ignored):', JSON.stringify(nav.result || nav.error || nav).slice(0,80));
  await wait(2000);

  // Poll for up to 12s for the root to populate (after mount + auto-click + load)
  let finalLen = 0, hasQ = false, noQuestions = false;
  for (let i = 0; i < 24; i++) {
    await wait(500);
    const r = await send('Runtime.evaluate', {
      expression: `(function(){const root=document.getElementById('root');const html=root?root.innerHTML:'';const h3s=[...document.querySelectorAll('h3')];const q=h3s.some(h=>(h.textContent||'').startsWith('Sample question'));return JSON.stringify({len:html.length,hasQ:q,noQuestions:html.includes('No questions'),buttons:[...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Questions').length});})()`,
      returnByValue: true,
    });
    const v = JSON.parse(r.result?.result?.value || '{}');
    finalLen = v.len || 0; hasQ = !!v.hasQ; noQuestions = !!v.noQuestions;
    if (finalLen > 200 && (hasQ || noQuestions)) break;
  }

  console.log('=== PROBE RESULT ===');
  console.log(JSON.stringify({ finalLen, hasQ, noQuestions }));
  const txt = await send('Runtime.evaluate', { expression: `(function(){const root=document.getElementById('root');return root?root.innerText.slice(0,600):'NO ROOT';})()`, returnByValue: true });
  console.log('=== ROOT TEXT (first 600) ===');
  console.log(txt.result?.result?.value);
  console.log('=== CAPTURED LOGS (' + logs.length + ') ===');
  logs.slice(0,8).forEach(l=>console.log(l));

  ws.close(); chrome.kill('SIGKILL'); process.exit(0);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
