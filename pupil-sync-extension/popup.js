// The extension's toolbar pop-up: one switch that connects this tab to the Gaze Annotator, or
// disconnects it. Opening the pop-up is what gives the extension access to this tab (Chrome's
// "activeTab"); background.js does the connecting and decides whether the tab qualifies.
(async () => {
  const $ = (id) => document.getElementById(id);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const ask = (m) => chrome.runtime.sendMessage(Object.assign({ tabId: tab ? tab.id : null, url: tab ? tab.url : '' }, m));

  function show(st) {
    st = st || {};
    $('sync').checked = !!st.connected;
    $('sync').disabled = !st.eligible && !st.connected;
    $('row').classList.toggle('off', $('sync').disabled);
    $('status').className = st.error ? 'bad' : st.connected ? 'good' : '';
    $('status').textContent = st.error ? st.error
      : st.connected ? '✓ On. Pupil follows the gaze you code in the Gaze Annotator.'
      : st.eligible ? 'Off. Turn on to let the Gaze Annotator move this Manual Mapper.'
      : 'Open the Manual Mapper in Pupil Cloud to turn sync on.';
  }

  show(await ask({ type: 'popup-state' }));
  $('sync').addEventListener('change', async (e) => {
    e.target.disabled = true;
    show(await ask({ type: 'popup-set', on: e.target.checked }));
  });
})();
