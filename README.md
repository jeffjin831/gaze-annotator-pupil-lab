# Gaze Annotator: guide for raters

<!-- github-only -->
> **Gaze Annotator** is a free, offline web app for coding eye-tracking gaze fixations (for example from Pupil Labs recordings) with an L1/L2/L3 tag dictionary, one session file per participant, and a tool to combine participants into one workbook. An optional Chrome extension keeps Pupil Cloud's Manual Mapper on the same fixation as the app.
>
> **Download:** get `GazeAnnotator_v1.7.zip` and the 2.5-minute guide video from [Releases](../../releases/latest), unzip, and double-click `gaze_annotator.html` in Chrome or Edge. No install, no internet needed.
>
> MIT licensed. Not affiliated with or endorsed by Pupil Labs; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The guide below is the same one shipped to raters as `Rater Guide.html`.
<!-- /github-only -->

A single web page for coding gazes. There's nothing to install, and the tag dictionary is built in. Your work goes into a **session file** on your computer (`<STUDY>_<MM-DD>_P<number>_Gaze_Annotation.csv`), and that file is what you keep, resume from, and hand in.

## What you need
- `gaze_annotator.html`: open it in **Chrome or Edge** (double-click it) on Windows or Mac. That's all. It works offline, with no internet needed.
- `combine_sessions.html`: a separate small tool for merging finished participant files into one file (see *Combining participants into one file* below).

## Setting up a session (the **Setup** screen)
1. **Tag dictionary**: usually nothing to do. Your study's tags are built into the app your coordinator gives you (one line at the bottom right of Setup).
2. **Session**: enter the **participant ID** (just the number, e.g. `31`) and the **session date**. Both are required. The session date is the day the session was *recorded*, not today. The file name is built from the date and the participant with a **P** in front (e.g. `STUDY_10-09_P31_Gaze_Annotation.csv`, where `STUDY` is your study code, set by your coordinator), while the Participant_ID column inside the file holds just the number (`31`). Each participant gets their own file.
3. **Prompts and gaze ranges**: a session usually has prompts 1 to 5–7. For each prompt number, enter the first and last gaze number, e.g. *Prompt 1: 100 to 200*. The app lists every gaze from 100 to 200 in order, then moves on to the next prompt. *+ Add prompt* adds the next prompt number and pre-fills its first gaze.
4. Click **Start annotating**. The first time, a Save window opens with the name `<STUDY>_<MM-DD>_P<number>_Gaze_Annotation.csv` filled in. Choose the folder to keep it in and click Save. You can switch the type to Excel (`.xlsx`) there if you prefer.

You can return to Setup at any time to fix a range. Gazes you've already coded keep their codes as long as they're still inside the new ranges. The app warns you before removing any.

## Coding a gaze (the **Annotate** screen)
For each gaze:
1. **L1_Gaze_Location**: pick exactly one. Hover over a button to see its definition, or check the line under the buttons after you pick.
2. **L2_Gaze_Location**: appears **only** when the L1 tag is a device (any L1 tag whose name contains "Device", marked with ▸). It's required for those gazes. If you change L1 to a non-device tag, L2 is cleared automatically.
3. **L3_Gaze_Context** (the context of the moment, e.g. whole group / small group): **optional**. You can code it together with L1/L2, or leave it for a second round. Once picked, it carries over to the next gaze in the same prompt; change it only when the context changes.
4. **Unsure**: click it, or press **U**, if you're not confident in this gaze's codes. It's exported as Y/N. This is different from any "unclear" or "can't tell" tag in your dictionary: use those tags when they describe the gaze, and the Unsure flag when you doubt your own coding.
5. **Notes** (optional): any feedback on this gaze.

Clicking a selected button again un-selects it. **Clear gaze** (right of Notes) removes all codes and the note from the gaze; until you move on, the same button reads **Undo clear** and puts them back.

### Coding several gazes at once
When a run of gazes all get the same codes:
1. In the gaze list on the left, **drag** from the first gaze to the last, or click the first and **Shift+click** the last. The selected gazes are highlighted, and the card reads, e.g., *8 selected · Prompt 1 · 102–109*.
2. Pick L1, then L2 for device tags, L3 and/or Unsure, or type a note. Each choice goes onto **all** selected gazes.
   - If the selected gazes already have different codes, the card says *Mixed in this selection*; picking a tag sets it on all of them.
   - L2 can be set in one go only when every selected gaze has a device L1.
   - **Clear selected** removes the codes from all of them.
3. **Undo** (or Ctrl/Cmd+Z) reverts the last change to the selection.
4. **Done** (or **Esc**) ends the selection and moves to the gaze after it. Clicking any single gaze in the list also ends it.

**The selection plays in Pupil by itself** (needs Sync Pupil, see below): as soon as you finish dragging or Shift+clicking, Pupil shows each selected gaze in turn, every 1 second by default. Change the seconds in the box at the top (0.3 to 10). The gaze on screen gets a blue bar in the list, and the top reads *▶ Playing 102*. **Space** pauses and resumes, or plays the range again once it has finished. Playback stops at the end of the range, on **Esc**, when you pick a tag, or if Pupil can't find a fixation. The selection stays, so you can code the whole range straight after watching it.

A gaze counts as **complete** (green dot) when it has L1, plus L2 if L1 is a device. A gaze flagged **Unsure** also counts as complete, so it's included in the progress bar and skipped by Next incomplete, but it's shown in **blue** (blue dot and *unsure* label) so unsure items stand out. A yellow dot means started but incomplete. A grey dot means not started. A `?` in the list marks gazes flagged Unsure.

### Moving around
The whole screen fits in one browser window with no scrolling, except the gaze list on the left. The navigation buttons are at the top right of the coding card.
- **Next →** / **← Prev**, the **→ / ←** arrow keys, or **D / A**. Keyboard shortcuts (including **U**) are switched off while you type in Notes or the Gaze # box, so you can type freely.
- **Next incomplete** jumps to the next gaze that still needs work.
- **B** jumps **back** to the first gaze of the uncoded stretch behind you. Example: gazes up to 99 are coded and you watched 100–105 without coding them; on 105, **B** takes you to 100. Pressing B again goes to the start of the uncoded stretch before that.
- **Gaze # → Go** jumps to a specific gaze number (hidden in very narrow windows; use the list instead).
- Click any gaze in the left-hand list.
- *Auto-advance when a gaze is complete* (optional checkbox) moves to the next gaze as soon as the current one is complete. A non-device gaze then takes a single click.
- *Require L3* (checkbox at the bottom): turn it on for an L3 round. Gazes without L3 then count as incomplete, so the progress bar and **Next incomplete** take you to the ones still missing L3.

The bar at the top shows how many gazes are complete.

## Saving, stopping and resuming
- **Save** (top right, or **Ctrl+S** / **Cmd+S** on Mac) writes your work into your session file. After the first time there's no dialog; it just saves.
- The top right shows **Saved 2:14 PM** in green, or **Unsaved changes** in amber. If you try to close the tab with unsaved changes, the browser asks you to confirm.
- **Need to stop?** Press Save, then close the page.
- Each Save shows a little burst of confetti and how far along you are, and there's a bigger one when the last gaze is coded. It's just for fun, and it's skipped if your computer is set to reduce motion.
- **Coming back** (same or another computer): open the page, go to *Setup → Resume previous work → Open saved session…*, and pick your session file. Your codes, participant ID, session date and prompts come back, and Save keeps writing into that same file.
- **Save as…** saves to a different file name, folder or format.
- The page also keeps a backup copy in the browser, so reopening it on the same computer usually brings you straight back. Treat the session file as the real copy.
- When you've finished, the session file *is* the finished annotation file: hand it in or upload it wherever your team collects them.
- In browsers that can't save into a chosen file (Safari, Firefox), **Save** downloads `<STUDY>_<MM-DD>_P<number>_Gaze_Annotation.csv` to your Downloads folder instead, and *Download .xlsx* replaces Save as…. Chrome or Edge is recommended.

### Session file template (one row per gaze)
| Participant_ID | Prompt_Number | Gaze_Number | L1_Gaze_Location | L2_Gaze_Location | L3_Gaze_Context | Unsure | Notes |
|---|---|---|---|---|---|---|---|
| 31 | 1 | 100 | Device-Laptop | On-task | Small group | Y | hand over screen |
| 31 | 1 | 101 | Screen | | Small group | N | |

L2 is blank when L1 isn't a device. Unsure is `Y` or `N`.

## Syncing with Pupil Cloud (optional)
If you code in the app while Pupil Cloud's **Manual Mapper** is open in Chrome, an optional extension makes Pupil follow along. Whenever the gaze changes in the app (Next, Prev, A/D, a click in the list, Next incomplete, Go to gaze #), Pupil jumps to the **same fixation number**. Gaze numbers are Pupil fixation numbers.

**One-time install (about 2 minutes, Chrome on Windows or Mac):**
1. Keep the `pupil-sync-extension` folder from the package somewhere permanent (e.g. Documents). Chrome loads it from there, so don't delete or move it afterwards.
2. In Chrome, open `chrome://extensions` and switch on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `pupil-sync-extension` folder.
4. On the extension's card click **Details**, and switch on **Allow access to file URLs**. This lets it talk to the app, which is a local file.
5. Click the puzzle-piece icon next to Chrome's address bar and **pin** *Gaze Annotator - Pupil Cloud Sync*, so its button stays on the toolbar.

Updating from an older version (1.x)? Copy the new `pupil-sync-extension` folder over the old one, then press the reload arrow on the extension's card in `chrome://extensions`. Version 2.0 no longer has any standing access to Pupil Cloud. It connects only when you click its button (see below).

**Using it:**
1. Open the recording in Pupil Cloud with the **Manual Mapper** showing, in Chrome. Then **click the extension's button** on that tab. A green **ON** badge means it's connected. Click it again to disconnect. Reloading or closing the tab also disconnects; just click again. If you see a red **!**, that tab isn't showing a Pupil Cloud enrichment page such as the Manual Mapper.
2. Open `gaze_annotator.html` in the same Chrome and put the two side by side: right-click the Pupil Cloud tab, choose Chrome's split view option (e.g. *Add tab to new split view*) and pick the app's tab. Without split view, use two windows snapped to the halves of the screen. A **Sync Pupil** switch appears at the bottom of the coding card (only when the extension is installed). Tick it. (When you start coding, the app shows a short tip with these install steps and the split view set-up, and says whether it can see the extension. *Sync tips* at the bottom brings it back.)
3. Code as usual. The footer shows **✓ Pupil on 1013** when Pupil is on the same fixation, or a short amber warning if not, e.g. when the Manual Mapper isn't open or Pupil doesn't have that fixation. Pupil doesn't move while you are still dragging; when you let go, it plays the selected gazes one by one (see *Coding several gazes at once*).
4. Keys go to whichever side you clicked last, so click on the app before using A, D, B, U or Space.

**Good to know:**
- Keep the app's file name `gaze_annotator.html`; the extension recognises the app by that name.
- The extension has no permission for any website until you click its button on a tab. It then works only in that one tab, and only while the tab shows a Pupil Cloud enrichment page (where the Manual Mapper lives). It makes no network requests and doesn't poll anything.
- The extension only types the fixation number into Pupil's Fixation box and presses Enter, as you would by hand. It never clicks Pupil's buttons or presses its shortcuts. (Pupil's own shortcuts in the Manual Mapper are **S** = next and **A** = previous; you don't need them while syncing.) It doesn't read, copy or send any recording data, and nothing leaves your computer.
- If Pupil Labs redesigns the Manual Mapper, syncing may stop, and the footer will show a warning. The app itself keeps working normally; switch Sync Pupil off and tell your coordinator.

**First-time live check** (do once, with a real recording):
1. Before connecting, tick Sync Pupil in the app: the footer should say *not connected - click the extension button on the Pupil Cloud tab*.
2. Click the extension's button on the Manual Mapper tab (green **ON**). Note the fixation shown in Pupil, e.g. 1013. In the app, open the same gaze number: Pupil should stay on (or jump to) that fixation.
3. Press **D** three times: Pupil should show 1016, and the footer **✓ Pupil on 1016**.
4. Type another gaze in *Go to gaze #* (e.g. 1100) and press Go: Pupil should jump to 1100.
5. Click the extension's button again (the badge disappears) and press D: Pupil should stay put and the footer should say *not connected*.
6. Untick Sync Pupil, press D: Pupil should stay put.

## Combining participants into one file
The app keeps one file per participant. To put all participants of a data-collection session into one file, use the separate tool `combine_sessions.html`:
1. Double-click `combine_sessions.html` (Chrome or Edge).
2. Drag the participant files onto the page, or click **Choose files…**. You can add files in several goes.
3. Check the list: one row per participant, with how many gazes are coded. It warns if a participant appears twice (remove the extra copy with ✕) or if the files come from different session dates.
4. Click **Save workbook (one tab per participant)**. This gives `<STUDY>_<MM-DD>_Gaze_Annotation_Combined.xlsx`, one tab per participant (named `P31`, `P32`, …) in the same 8-column template. **Save one CSV (all participants)** instead gives a single sheet with everyone's rows stacked, which is handy for analysis.

Your participant files are only read, never changed. If you open the combined workbook in the annotation app, it asks which participant to open and saves that participant to their own file, so the combined workbook is never overwritten.

## Starting a new participant / session
Save first. Then go to *Setup → Clear session (start over)*, enter the new participant ID, session date and ranges, and click Start annotating. You'll be asked where to save the new session file.

## Troubleshooting
- **"Could not save … If the file is open in Excel…"**: Excel locks files it has open. Close the file in Excel and press Save again.
- **Chrome asks "Allow this site to edit …?"** when you save after reopening the page: click *Allow* (or *Edit file*). Chrome asks once per visit.
- **"No browser backup - press Save often!" in red**: the browser is blocking storage (private window, or strict privacy settings). Your session file still works; just save often.
- **A tag button has a red dashed border**: that gaze uses a tag that isn't in the current dictionary, for example after the dictionary was updated. Re-code it.

---

## For the study coordinator: the dictionary
- The public app ships with a small **made-up example dictionary** (the same tags as `examples/example_dictionary.csv`). Replace it with your own in one of two ways:
  - **Built in (recommended, raters load nothing):** put your dictionary in `private/dictionary.json` (same shape as the `BUILTIN_DICT` block in `gaze_annotator.html`; `private/` is git-ignored) and run `python tools/build.py --lab`. This gives `dist/GazeAnnotator_v<version>_lab.zip` with your tags built in. Hand that package to your raters and never publish it.
  - **Loaded:** raters load your dictionary workbook (or CSV) once via *Setup → Tag dictionary → Change… → Load an updated workbook*. It's remembered in that browser and can be switched back to the built-in one in the *Dictionary* dropdown.
- A plain `python tools/build.py` always builds the public package with the example tags, and stops if any definition from `private/dictionary.json` would end up in it.
- Workbook format: column **A** is the level (`L1_…`, `L2_…`, `L3_…`), **B** is the tag text (exactly what appears on the button and in the export), and **C onward** is the definition and guidance. Other rows are ignored. A loaded workbook uses its last sheet that has `L1_` rows.
- **L2 buttons appear for any L1 tag whose name contains "Device"**, so a new tag such as `Device-Smartwatch` gets L2 automatically.
- **L3_Gaze_Context** options come from `L3_…` rows; if a loaded workbook has none, the built-in L3 list is used.
- Export column names are fixed by the template above, whatever the level names are in the workbook.
- **Study code in file names:** `filePrefix` in `private/dictionary.json` (e.g. your study's short code) replaces the default `STUDY` in every file name; a code ending in two digits (e.g. `ABC26`) also tells the app the year when a session is reopened.

## Files
- `combine_sessions.html`: the separate combine tool (source; loads SheetJS from the CDN like the app, and the shipped build inlines it).
- `gaze_annotator.html`: the app (source). It loads SheetJS from `cdn.sheetjs.com` (pinned, integrity-checked); the shipped build inlines it.
- `tools/build.py`: builds the package for raters. Run `python tools/build.py` (public, example tags) or `python tools/build.py --lab` (your private dictionary built in) to get `dist/GazeAnnotator_v<version>[_lab].zip` (the app and the combine tool with SheetJS inlined, plus `Rater Guide.html` made from this README, without this Files section).
- `pupil-sync-extension/`: the optional Chrome extension for syncing with Pupil Cloud (`manifest.json`, with no site permissions, only `activeTab`, `scripting` and `storage`; `app.js` runs in the app page; `background.js` connects to the one Pupil Cloud tab where you click the extension's button and passes requests to it; `pupil.js` is added to that tab on the click, types the fixation number into the Fixation box and presses Enter, which is how Pupil's Manual Mapper applies a number). It recognises Pupil's Fixation box by the "Skip to next/previous" buttons right next to it, because Pupil's generated class names change between releases.
- `video/make_video.html` + `tools/devserver.py`: make the 2½-minute guide video (`dist/GazeAnnotator_Guide.mp4`). Start the server with `python tools/devserver.py`, open `http://127.0.0.1:8766/video/make_video.html` in Chrome, and it drives the real app, captures each step, encodes an MP4 in the browser and saves it to `video/out/`. Re-run it after UI changes so the video stays accurate.
- `test/mock_pupil.html`: a stand-in for Pupil's Manual Mapper panel, used to test the extension (not shipped).
- `LICENSE` (MIT) and `THIRD_PARTY_NOTICES.md` (SheetJS, Apache-2.0; development-only libraries; trademarks).
- `vendor/xlsx-0.20.3.full.min.js`: the SheetJS copy the build inlines; the build checks it against the page's pinned hash.
- `examples/example_dictionary.csv`: the made-up example dictionary as a file, a template for your own (columns Level, Category, Definition).
- `private/` (not in the repository): your own `dictionary.json` for `tools/build.py --lab`, and your dictionary workbook.
- `test/sample_gaze_sheet.csv`: a small synthetic sheet with Prompt / Gaze columns. *Open saved session…* can also load a sheet like this.
