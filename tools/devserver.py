"""Local dev server for making the guide video (not shipped).

    python tools/devserver.py [port]

Serves the project folder on 127.0.0.1 like `python -m http.server`, and accepts
POST /save/<file name> to write a file into video/out/ (used by video/make_video.html
to store the finished MP4). Nothing else can be written.
"""
import re
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'video' / 'out'


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        m = re.fullmatch(r'/save/([A-Za-z0-9._-]{1,80})', self.path)
        if not m:
            self.send_error(404); return
        size = int(self.headers.get('Content-Length', 0))
        if size <= 0 or size > 500 * 1024 * 1024:
            self.send_error(413); return
        OUT.mkdir(parents=True, exist_ok=True)
        target = OUT / m.group(1)
        with open(target, 'wb') as f:
            remaining = size
            while remaining:
                chunk = self.rfile.read(min(remaining, 1 << 20))
                if not chunk: break
                f.write(chunk); remaining -= len(chunk)
        self.send_response(200); self.send_header('Content-Type', 'text/plain'); self.end_headers()
        self.wfile.write(f'saved {target.relative_to(ROOT).as_posix()} ({size} bytes)'.encode())


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    server = ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=str(ROOT)))
    print(f'serving {ROOT} on http://127.0.0.1:{port}', flush=True)
    server.serve_forever()
