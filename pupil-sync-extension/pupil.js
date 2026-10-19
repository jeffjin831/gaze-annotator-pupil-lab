// Added to a Pupil Cloud tab only when the rater clicks the extension's button on it, and it acts only
// while that tab shows a project enrichment page (where the Manual Mapper lives).
// Pupil's Manual Mapper (checked against its page code):
// - the Fixation box jumps to a fixation when Enter is pressed in it
//   (onKeyDown: key === 'Enter' -> staticImageMappers.setFixation), and shows a
//   "Fixation not found" pop-up when that fixation does not exist.
// The extension only ever uses that: type the number, press Enter. It does not click Pupil's buttons
// or press its S / A shortcuts.
// What it reads: the Fixation box and the labels of the buttons right next to it (to recognise the
// Manual Mapper panel), and, for half a second after each jump, the text of new Pupil pop-ups.
(() => {
  if (window.__gazeSyncOn) return;   // already connected in this page
  window.__gazeSyncOn = true;

  const PUPIL_HOSTS = ['cloud.pupil-labs.com', 'ui.cloud.pupil-labs.com'];
  const ENRICHMENT_PATH = /^\/workspaces\/[^/]+\/projects\/[^/]+\/enrichments\/[^/]+/;
  const onEnrichmentPage = () => PUPIL_HOSTS.includes(location.hostname) && ENRICHMENT_PATH.test(location.pathname);
  const text = (el) => (el.textContent || '').trim().toLowerCase();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

  // The Fixation box: a number box with Pupil's "Skip to next" / "Skip to previous" buttons close by.
  // Pupil's generated class names and ids change between releases; those button labels do not.
  // Only buttons within a few levels around a number box are looked at, never the rest of the page.
  const NEAR = 8;
  function fixationBox() {
    for (const input of document.querySelectorAll('input[type="number"]')) {
      let el = input.parentElement;
      for (let up = 0; el && el !== document.body && up < NEAR; up++, el = el.parentElement) {
        const labels = [...el.querySelectorAll('button')].map(text);
        if (labels.includes('skip to next') || labels.includes('skip to previous')) return input;
      }
    }
    return null;
  }
  const current = (box) => { const v = box ? Number(box.value) : NaN; return Number.isFinite(v) ? v : null; };

  // Pupil reports an unknown fixation with a pop-up (its "notistack" snackbar). For a moment, check
  // the text of new pop-ups only; the text of anything else that changes on the page is not read.
  const POPUP = '.notistack-MuiContent';
  function watchNotFound(ms) {
    return new Promise((resolve) => {
      let seen = false;
      const obs = new MutationObserver((list) => {
        for (const m of list) for (const node of m.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const popups = node.matches(POPUP) ? [node] : [...node.querySelectorAll(POPUP)];
          if (popups.some((p) => /fixation not found/i.test(p.textContent || ''))) seen = true;
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(seen); }, ms);
    });
  }

  async function goTo(n) {
    const box = fixationBox();
    if (!box) return { ok: false, error: 'Fixation box not found' };
    const before = current(box);
    // type the number (React picks it up from the native setter plus an input event), then press Enter
    setValue.call(box, String(n));
    box.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(40);   // let React store the typed number before Enter reads it
    const notFound = watchNotFound(500);
    const enter = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true };
    box.dispatchEvent(new KeyboardEvent('keydown', enter));
    box.dispatchEvent(new KeyboardEvent('keyup', enter));
    if (await notFound) return { ok: false, fixation: before, error: 'Pupil has no fixation ' + n };
    return { ok: true, method: 'typed', fixation: n };
  }

  // only the extension's own background script can send these messages (web pages cannot)
  function onMessage(msg, sender, reply) {
    if (msg.type === 'disconnect') {   // the rater clicked the button again: stop listening
      chrome.runtime.onMessage.removeListener(onMessage);
      window.__gazeSyncOn = false;
      return false;
    }
    if (!onEnrichmentPage()) { reply({ ok: false, found: false, offPage: true, error: 'not on the Manual Mapper' }); return false; }
    if (msg.type === 'probe') { const box = fixationBox(); reply({ found: !!box, fixation: current(box) }); return false; }
    if (msg.type === 'goto') { goTo(Number(msg.fixation)).then(reply); return true; }
    return false;
  }
  chrome.runtime.onMessage.addListener(onMessage);
})();
