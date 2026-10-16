// Runs on Pupil Cloud pages. Pupil's Manual Mapper (checked against its page code):
// - the Fixation box jumps to a fixation when Enter is pressed in it
//   (onKeyDown: key === 'Enter' -> staticImageMappers.setFixation), and shows a
//   "Fixation not found" pop-up when that fixation does not exist.
// The extension only ever uses that: type the number, press Enter. It does not click
// Pupil's buttons or press its S / A shortcuts. The box is found via the "Skip to next" /
// "Skip to previous" buttons next to it, because Pupil's generated class names and ids
// change between releases while the button texts do not.
(() => {
  const text = (el) => (el.textContent || '').trim().toLowerCase();
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;

  function controls() {
    const buttons = [...document.querySelectorAll('button')];
    const next = buttons.find((b) => text(b) === 'skip to next');
    const prev = buttons.find((b) => text(b) === 'skip to previous');
    const anchor = next || prev;
    if (!anchor) return null;
    // walk up from the button until the container also holds the number box
    let input = null;
    for (let el = anchor.parentElement; el && el !== document.body && !input; el = el.parentElement) {
      input = el.querySelector('input[type="number"]');
    }
    return { input };
  }
  const current = (c) => {
    const v = c && c.input ? Number(c.input.value) : NaN;
    return Number.isFinite(v) ? v : null;
  };

  // Pupil reports an unknown fixation with a pop-up (its "notistack" snackbar). For a moment,
  // check the text of new pop-ups only; no other text on the page is read.
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
    const c = controls();
    if (!c) return { ok: false, error: 'Manual Mapper not found on the Pupil Cloud page' };
    if (!c.input) return { ok: false, error: 'Fixation box not found' };
    const before = current(c);
    // type the number (React picks it up from the native setter plus an input event), then press Enter
    setValue.call(c.input, String(n));
    c.input.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(40);   // let React store the typed number before Enter reads it
    const notFound = watchNotFound(500);
    const enter = { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true };
    c.input.dispatchEvent(new KeyboardEvent('keydown', enter));
    c.input.dispatchEvent(new KeyboardEvent('keyup', enter));
    if (await notFound) return { ok: false, fixation: before, error: 'Pupil has no fixation ' + n };
    return { ok: true, method: 'typed', fixation: n };
  }

  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (msg.type === 'probe') {
      const c = controls();
      reply({ found: !!c, hasInput: !!(c && c.input), fixation: current(c) });
      return false;
    }
    if (msg.type === 'goto') { goTo(Number(msg.fixation)).then(reply); return true; }
    return false;
  });
})();
