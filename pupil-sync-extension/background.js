// Connects to ONE Pupil Cloud tab, and only when the rater clicks the extension's toolbar button on
// that tab. Until then the extension has no access to Pupil Cloud (or any other website): it holds no
// standing site permission, only Chrome's "activeTab" grant for the tab that was clicked.
// Only the Gaze Annotator page (a local gaze_annotator.html file) may send requests.

const PUPIL_HOSTS = ['cloud.pupil-labs.com', 'ui.cloud.pupil-labs.com'];
// the Manual Mapper is shown on a project enrichment page: /workspaces/../projects/../enrichments/..
const ENRICHMENT_PATH = /^\/workspaces\/[^/]+\/projects\/[^/]+\/enrichments\/[^/]+/;
const TITLE_OFF = 'Gaze Annotator sync: open the Manual Mapper in Pupil Cloud, then click here to connect';
const NOT_CONNECTED = 'not connected - click the extension button on the Pupil Cloud tab';

function isEnrichmentPage(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && PUPIL_HOSTS.includes(u.hostname) && ENRICHMENT_PATH.test(u.pathname);
  } catch (e) { return false; }
}

// the connected tab survives the background script being put to sleep (session storage is cleared
// when Chrome closes)
const connectedTab = async () => { const v = (await chrome.storage.session.get('tabId')).tabId; return Number.isInteger(v) ? v : null; };
const remember = (tabId) => chrome.storage.session.set({ tabId });
const quiet = (p) => p.catch(() => {});   // the tab may already be gone

function badge(tabId, text, color, title) {
  quiet(chrome.action.setBadgeText({ tabId, text }));
  if (color) quiet(chrome.action.setBadgeBackgroundColor({ tabId, color }));
  quiet(chrome.action.setTitle({ tabId, title }));
}

async function disconnect(tabId, tellPage) {
  await remember(null);
  badge(tabId, '', null, TITLE_OFF);
  if (tellPage) await quiet(chrome.tabs.sendMessage(tabId, { type: 'disconnect' }));
}

// toolbar button: connect this tab (if it is a Pupil Cloud enrichment page), or disconnect it
chrome.action.onClicked.addListener(async (tab) => {
  const current = await connectedTab();
  if (current === tab.id) { await disconnect(tab.id, true); return; }
  if (!isEnrichmentPage(tab.url)) {
    badge(tab.id, '!', '#c0392b', 'Not connected: open the Manual Mapper in Pupil Cloud first, then click here');
    return;
  }
  if (current !== null) await disconnect(current, true);   // one tab at a time
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['pupil.js'] });   // top frame only
  } catch (e) {
    badge(tab.id, '!', '#c0392b', 'Could not connect: ' + ((e && e.message) || e));
    return;
  }
  await remember(tab.id);
  badge(tab.id, 'ON', '#1f9d55', 'Connected to this tab. Click to disconnect.');
});

chrome.tabs.onRemoved.addListener(async (tabId) => { if (tabId === await connectedTab()) await remember(null); });
// a reload removes our script from the page: show that the tab is no longer connected
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status !== 'complete' || tabId !== await connectedTab()) return;
  try { await chrome.tabs.sendMessage(tabId, { type: 'probe' }); } catch (e) { await disconnect(tabId, false); }
});

async function handle(msg) {
  const tabId = await connectedTab();
  if (tabId === null) return { ok: false, linked: false, error: NOT_CONNECTED };
  let probe;
  try { probe = await chrome.tabs.sendMessage(tabId, { type: 'probe' }); }
  catch (e) { await disconnect(tabId, false); return { ok: false, linked: false, error: NOT_CONNECTED }; }
  if (!probe || probe.offPage) return { ok: false, linked: true, error: 'the connected Pupil tab is not on the Manual Mapper' };
  if (!probe.found) return { ok: false, linked: true, error: 'Manual Mapper not found on the connected tab' };
  if (msg.type === 'status') return { ok: true, linked: true, fixation: probe.fixation };
  if (msg.type === 'goto') {
    const n = Number(msg.fixation);
    if (!Number.isInteger(n) || n < 1) return { ok: false, linked: true, error: 'invalid fixation number' };
    const res = await chrome.tabs.sendMessage(tabId, { type: 'goto', fixation: n });
    return Object.assign({ linked: true }, res);
  }
  return { ok: false, error: 'unknown request' };
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!sender.url || !/^file:.*gaze_annotator\.html/i.test(sender.url)) return false;
  handle(msg).then(reply, (e) => reply({ ok: false, error: String((e && e.message) || e) }));
  return true;   // reply comes asynchronously
});
