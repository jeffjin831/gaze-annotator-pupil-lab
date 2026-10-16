"""Build the shippable Gaze Annotator package.

    python tools/build.py          public package: the app with its made-up example dictionary
    python tools/build.py --lab    lab package: private/dictionary.json baked in as the built-in dictionary

private/ is never committed, so the lab's own coding dictionary stays out of the public repository.
The public build refuses to finish if any definition from private/dictionary.json would end up in it.

Produces dist/GazeAnnotator/ and dist/GazeAnnotator_v<VERSION>.zip (lab: dist/GazeAnnotator_lab/ and
dist/GazeAnnotator_v<VERSION>_lab.zip) containing:
  - gaze_annotator.html    the app, with SheetJS inlined so it works offline as one file
  - combine_sessions.html  the separate tool that merges participant files (SheetJS inlined too)
  - Rater Guide.html       README.md rendered as a page raters can open in a browser
  - pupil-sync-extension/  the optional Chrome extension that keeps Pupil Cloud on the same fixation
"""
import base64
import hashlib
import html
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

VERSION = '1.7'
ROOT = Path(__file__).resolve().parent.parent
PAGES = [ROOT / 'gaze_annotator.html', ROOT / 'combine_sessions.html']
README = ROOT / 'README.md'
LIB = ROOT / 'vendor' / 'xlsx-0.20.3.full.min.js'
DIST = ROOT / 'dist'
PRIVATE_DICT = ROOT / 'private' / 'dictionary.json'
DICT_BLOCK = re.compile(r'  // <built-in-dictionary>.*?  // </built-in-dictionary>\n', re.S)


def bake_dictionary(page: str, d: dict) -> str:
    """Replace the app's example dictionary block with the lab's private dictionary."""
    if not DICT_BLOCK.search(page):
        sys.exit('build: built-in dictionary markers not found in gaze_annotator.html')
    lit = json.dumps(d, ensure_ascii=False, indent=2).replace('</', '<\\/')   # safe inside <script>
    block = ('  // <built-in-dictionary>  (lab dictionary, baked in from private/dictionary.json)\n'
             '  const BUILTIN_DICT = ' + lit.replace('\n', '\n  ') + ';\n  // </built-in-dictionary>\n')
    return DICT_BLOCK.sub(lambda _m: block, page, count=1)


def private_strings(d: dict) -> list:
    """Definitions and the study code in the lab dictionary: none of them may appear in a public build."""
    defs = [it['def'] for lv in ('L1', 'L2', 'L3') for it in d.get(lv, {}).get('items', []) if len(it.get('def', '')) >= 12]
    code = str(d.get('filePrefix', ''))
    return defs + ([code] if len(code) >= 3 else [])


def inline_sheetjs(page: str) -> str:
    tag = re.search(r'<script src="https://cdn\.sheetjs\.com/[^"]+"\s+integrity="([^"]+)"[^>]*></script>', page)
    if not tag:
        sys.exit('build: SheetJS <script> tag not found')
    lib = LIB.read_bytes()
    # the vendored file must be byte-identical to the CDN file the page pins
    digest = 'sha384-' + base64.b64encode(hashlib.sha384(lib).digest()).decode()
    if digest != tag.group(1):
        sys.exit(f'build: {LIB.name} does not match the pinned integrity hash ({digest})')
    # "<!--" only appears as the JS string literal "<!--"; "<\!--" is the same string to JS
    # but cannot be mistaken for markup by the HTML parser
    js = lib.decode('utf-8').replace('"<!--"', '"<\\!--"')
    if re.search(r'</script|<!--', js, re.I):
        sys.exit('build: library contains text that cannot be inlined safely')
    comment = '<!-- SheetJS 0.20.3 (inlined at build time, sha384 verified) -->\n'
    return page[:tag.start()] + comment + '<script>' + js + '</script>' + page[tag.end():]


def inline_md(text: str) -> str:
    t = html.escape(text, quote=False)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![*\w])\*([^*\s][^*]*?)\*(?!\w)', r'<em>\1</em>', t)
    return t


def md_to_html(md: str) -> str:
    """Just enough Markdown for README.md: headings, lists, tables, paragraphs, rules."""
    out, lines, i = [], md.splitlines(), 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
        elif line.startswith('#'):
            level = len(line) - len(line.lstrip('#'))
            out.append(f'<h{level}>{inline_md(line[level:].strip())}</h{level}>'); i += 1
        elif line.strip() == '---':
            out.append('<hr>'); i += 1
        elif line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-+:?', c) for c in cells):
                    rows.append(cells)
                i += 1
            head = ''.join(f'<th>{inline_md(c)}</th>' for c in rows[0])
            body = ''.join('<tr>' + ''.join(f'<td>{inline_md(c)}</td>' for c in r) + '</tr>' for r in rows[1:])
            out.append(f'<div class="tbl"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
        elif re.match(r'\s*(-|\d+\.) ', line):
            ordered = bool(re.match(r'\s*\d+\. ', line))
            items = []
            while i < len(lines) and lines[i].strip():
                m = re.match(r'(\s*)(-|\d+\.) (.*)', lines[i])
                if m and len(m.group(1)) == 0:
                    items.append([m.group(3)])
                elif m:  # nested item: keep it as its own line inside the parent item
                    items[-1].append('• ' + m.group(3))
                else:
                    items[-1][-1] += ' ' + lines[i].strip()
                i += 1
            tag = 'ol' if ordered else 'ul'
            out.append(f'<{tag}>' + ''.join('<li>' + '<br>'.join(inline_md(x) for x in it) + '</li>' for it in items) + f'</{tag}>')
        else:
            para = []
            while i < len(lines) and lines[i].strip() and not re.match(r'(#|\||---|\s*(-|\d+\.) )', lines[i]):
                para.append(lines[i].strip()); i += 1
            out.append('<p>' + inline_md(' '.join(para)) + '</p>')
    return '\n'.join(out)


GUIDE_PAGE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gaze Annotator - Rater Guide</title>
<style>
  :root {{ --bg:#ffffff; --ink:#1d2433; --muted:#667085; --line:#dde2ea; --code:#f2f4f7; --accent:#2457d6; }}
  @media (prefers-color-scheme: dark) {{ :root {{ --bg:#12151b; --ink:#e7ebf2; --muted:#98a2b3; --line:#313948; --code:#222834; --accent:#5b8cff; }} }}
  body {{ margin:0; background:var(--bg); color:var(--ink); font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }}
  main {{ max-width:820px; margin:0 auto; padding:24px 16px 48px; }}
  h1 {{ font-size:26px; margin:0 0 4px; }} h2 {{ font-size:19px; margin:28px 0 8px; padding-top:12px; border-top:1px solid var(--line); }}
  h3 {{ font-size:16px; margin:20px 0 6px; }} .ver {{ color:var(--muted); font-size:13px; }}
  code {{ background:var(--code); padding:1px 5px; border-radius:4px; font-size:13px; }}
  li {{ margin:4px 0; }} hr {{ border:0; border-top:2px solid var(--line); margin:32px 0; }}
  .tbl {{ overflow-x:auto; }} table {{ border-collapse:collapse; font-size:13px; }}
  th, td {{ border:1px solid var(--line); padding:5px 8px; text-align:left; white-space:nowrap; }}
</style></head>
<body><main>
<div class="ver">Version {version}</div>
{body}
</main></body></html>
"""


def main():
    lab = '--lab' in sys.argv[1:]
    lab_dict = json.loads(PRIVATE_DICT.read_text(encoding='utf-8')) if PRIVATE_DICT.exists() else None
    if lab and not lab_dict:
        sys.exit(f'build: --lab needs {PRIVATE_DICT.relative_to(ROOT)}')
    out = DIST / ('GazeAnnotator_lab' if lab else 'GazeAnnotator')
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)

    for src in PAGES:
        page = src.read_text(encoding='utf-8')
        if lab and src.name == 'gaze_annotator.html':
            page = bake_dictionary(page, lab_dict)
        (out / src.name).write_text(inline_sheetjs(page), encoding='utf-8', newline='')

    md = README.read_text(encoding='utf-8')
    md = re.split(r'\n## Files\n', md)[0]          # project file list is not for raters
    md = re.sub(r'<!-- github-only -->.*?<!-- /github-only -->\n*', '', md, flags=re.S)   # repo intro is not for raters
    (out / 'Rater Guide.html').write_text(GUIDE_PAGE.format(version=VERSION, body=md_to_html(md)), encoding='utf-8')

    shutil.copytree(ROOT / 'pupil-sync-extension', out / 'pupil-sync-extension')

    if not lab and lab_dict:   # the public package must not carry any of the lab's definitions
        leaked = [p for f in out.rglob('*') if f.is_file() for p in private_strings(lab_dict)
                  if p in f.read_text(encoding='utf-8', errors='ignore')]
        if leaked:
            sys.exit('build: public package contains lab dictionary text, e.g. ' + repr(leaked[0][:60]))

    zip_path = DIST / (f'GazeAnnotator_v{VERSION}_lab.zip' if lab else f'GazeAnnotator_v{VERSION}.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(out.rglob('*')):
            if f.is_file():
                z.write(f, 'GazeAnnotator/' + f.relative_to(out).as_posix())
    print(f'built {zip_path.relative_to(ROOT)}' + ('  (LAB package: contains the private dictionary, do not publish)' if lab else ''))
    for f in sorted(out.iterdir()):
        print(f'  {f.name}  {f.stat().st_size:,} bytes')


if __name__ == '__main__':
    main()
