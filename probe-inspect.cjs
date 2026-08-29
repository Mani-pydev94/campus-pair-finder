const { spawn } = require('child_process');
const { WebSocket } = require('ws');
const fs = require('fs');
const PORT = 8083;
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const URL = `http://localhost:${PORT}/probe-debug`;
let ws, msgId = 0; const pending = new Map();
function send(m,p){const id=++msgId;return new Promise(r=>{pending.set(id,r);ws.send(JSON.stringify({id,method:m,params:p||{}}));});}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
(async()=>{
  const chrome=spawn(CHROME,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9222','--user-data-dir='+fs.mkdtempSync(process.env.TEMP+'/cdp-'),URL],{stdio:'ignore'});
  await wait(3000);
  const t=(await fetch('http://localhost:9222/json').then(r=>r.json())).find(x=>x.url.includes('probe-debug'))||(await fetch('http://localhost:9222/json').then(r=>r.json()))[0];
  ws=new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(res=>ws.on('open',res));
  await wait(400); await send('Runtime.enable'); await send('Log.enable');
  await wait(6000);
  const r=await send('Runtime.evaluate',{expression:`(function(){const root=document.getElementById('root');return root?root.innerText.slice(0,800):'NO ROOT';})()`,returnByValue:true});
  console.log('=== ROOT TEXT ==='); console.log(r.result?.result?.value);
  ws.close(); chrome.kill('SIGKILL'); process.exit(0);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
