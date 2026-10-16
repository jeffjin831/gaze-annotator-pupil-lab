// Runs inside the Gaze Annotator page (a local file). It only relays messages:
// page -> extension background -> Pupil Cloud tab, and the result back to the page.
(() => {
  const post = (m) => window.postMessage(Object.assign({ source: 'gaze-pupil-ext' }, m), '*');

  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.source !== 'gaze-annotator') return;
    const m = e.data;
    chrome.runtime.sendMessage({ type: m.type, fixation: m.fixation }, (res) => {
      if (chrome.runtime.lastError) res = { ok: false, error: chrome.runtime.lastError.message };
      post(Object.assign({ type: 'result', id: m.id, req: m.type }, res || { ok: false, error: 'no answer' }));
    });
  });

  // tell the page the extension is installed, so it can show the "Sync Pupil" switch
  post({ type: 'hello', version: chrome.runtime.getManifest().version });
})();
