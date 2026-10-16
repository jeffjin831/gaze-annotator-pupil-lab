// Finds the Pupil Cloud tab that has the Manual Mapper open and passes requests to it.
// Only the Gaze Annotator page (a local gaze_annotator.html file) may send requests.

async function findPupilTab() {
  const tabs = await chrome.tabs.query({ url: ['https://cloud.pupil-labs.com/*', 'https://ui.cloud.pupil-labs.com/*'] });
  tabs.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));   // most recently used first
  for (const tab of tabs) {
    try {
      const probe = await chrome.tabs.sendMessage(tab.id, { type: 'probe' });
      if (probe && probe.found) return { tab, probe };
    } catch (e) { /* tab without our script (e.g. still loading) */ }
  }
  return null;
}

async function handle(msg) {
  const hit = await findPupilTab();
  if (!hit) return { ok: false, linked: false, error: 'Manual Mapper not open in Chrome' };
  if (msg.type === 'status') return { ok: true, linked: true, fixation: hit.probe.fixation };
  if (msg.type === 'goto') {
    const n = Number(msg.fixation);
    if (!Number.isInteger(n) || n < 1) return { ok: false, linked: true, error: 'invalid fixation number' };
    const res = await chrome.tabs.sendMessage(hit.tab.id, { type: 'goto', fixation: n });
    return Object.assign({ linked: true }, res);
  }
  return { ok: false, error: 'unknown request' };
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!sender.url || !/^file:.*gaze_annotator\.html/i.test(sender.url)) return false;
  handle(msg).then(reply, (e) => reply({ ok: false, error: String((e && e.message) || e) }));
  return true;   // reply comes asynchronously
});
