// Connects to ONE Pupil Cloud tab, and only when the rater switches "Sync this tab" on in the
// extension's toolbar pop-up on that tab. Until then the extension has no access to Pupil Cloud (or any
// other website): it holds no standing site permission, only Chrome's "activeTab" grant for the tab
// where the pop-up was opened.
// Requests come only from the extension's own pop-up or from the Gaze Annotator page (a local
// gaze_annotator.html file).

const PUPIL_HOSTS = ['cloud.pupil-labs.com', 'ui.cloud.pupil-labs.com'];
// the Manual Mapper is shown on a project enrichment page: /workspaces/../projects/../enrichments/..
const ENRICHMENT_PATH = /^\/workspaces\/[^/]+\/projects\/[^/]+\/enrichments\/[^/]+/;
const TITLE_OFF = 'Gaze Annotator - Pupil sync';
const NOT_CONNECTED = 'not connected - switch sync on in the extension on the Pupil Cloud tab';

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

function badge(tabId, text, title) {
  quiet(chrome.action.setBadgeText({ tabId, text }));
  if (text) quiet(chrome.action.setBadgeBackgroundColor({ tabId, color: '#1f9d55' }));
  quiet(chrome.action.setTitle({ tabId, title }));
}

async function connect(tabId) {
  const current = await connectedTab();
  if (current !== null && current !== tabId) await disconnect(current, true);   // one tab at a time
  await chrome.scripting.executeScript({ target: { tabId }, files: ['pupil.js'] });   // top frame only
  await remember(tabId);
  badge(tabId, 'ON', 'Gaze Annotator - Pupil sync is on for this tab');
}

async function disconnect(tabId, tellPage) {
  if (tabId === await connectedTab()) await remember(null);
  badge(tabId, '', TITLE_OFF);
  if (tellPage) await quiet(chrome.tabs.sendMessage(tabId, { type: 'disconnect' }));
}

// is this tab connected, with our script still in the page (a reload removes it)?
async function isConnected(tabId) {
  if (tabId === null || tabId === undefined || tabId !== await connectedTab()) return false;
  try { await chrome.tabs.sendMessage(tabId, { type: 'probe' }); return true; }
  catch (e) { await disconnect(tabId, false); return false; }
}

// the pop-up's switch: report this tab's state, or switch sync on / off for it
async function handlePopup(msg) {
  const eligible = isEnrichmentPage(msg.url);
  if (msg.type === 'popup-set') {
    if (msg.on && !eligible) return { eligible, connected: false, error: 'This tab is not a Pupil Cloud Manual Mapper page.' };
    try {
      if (msg.on) await connect(msg.tabId); else await disconnect(msg.tabId, true);
    } catch (e) {
      return { eligible, connected: false, error: 'Could not connect: ' + ((e && e.message) || e) };
    }
  }
  return { eligible, connected: await isConnected(msg.tabId) };
}

chrome.tabs.onRemoved.addListener(async (tabId) => { if (tabId === await connectedTab()) await remember(null); });
// a reload removes our script from the page: show that the tab is no longer connected
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status === 'complete') await isConnected(tabId);
});

// requests from the Gaze Annotator page
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
  const fromPopup = sender.id === chrome.runtime.id && sender.url === chrome.runtime.getURL('popup.html');
  const fromApp = !!sender.url && /^file:.*gaze_annotator\.html/i.test(sender.url);
  if (!fromPopup && !fromApp) return false;   // anything else is ignored
  (fromPopup ? handlePopup(msg) : handle(msg)).then(reply, (e) => reply({ ok: false, error: String((e && e.message) || e) }));
  return true;   // reply comes asynchronously
});
