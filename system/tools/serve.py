#!/usr/bin/env python3
"""Serve site/ on this machine the way the host serves it, at its real addresses.

    python3 tools/serve.py           http://127.0.0.1:8000/
    python3 tools/serve.py 4000      another port

Cloudflare Workers serves components/lightbox.html at /components/lightbox and sends /components/lightbox.html and
/components/lightbox/ there (html_handling "auto-trailing-slash"); an address with no file gets 404.html and the
status 404 (not_found_handling "404-page"). This does the same, so a page opened, reloaded or linked straight to
behaves here as it will on the site. tools/site_check.py serves the site with it.
"""
import functools, http.server, pathlib, re, sys, threading, urllib.parse

SITE = pathlib.Path(__file__).resolve().parent.parent / 'site'


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k):
        pass

    def handle(self):
        try:
            super().handle()
        except (BrokenPipeError, ConnectionResetError):
            pass  # the browser stopped a download it no longer needed (a film the page moved away from)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')  # a rebuilt site is seen at once
        super().end_headers()

    def _move(self, to):
        self.send_response(307)
        self.send_header('Location', to)
        self.end_headers()

    def _missing(self):
        page = SITE / '404.html'
        body = page.read_bytes() if page.exists() else b'Not found'
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def _route(self):
        """None when the request is for a file as it is; else what was done instead (True)."""
        url = urllib.parse.urlsplit(self.path)
        path = urllib.parse.unquote(url.path)
        query = '?' + url.query if url.query else ''
        if path == '/favicon.ico':
            self.send_response(204); self.end_headers(); return True
        if re.fullmatch(r'/kits/[a-z0-9-]+/card-\d+\.webp', path):
            # A kit's picture comes from the shop, another Worker on trayui.com/kits: here the home page gets a stand-in.
            body = (b'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800"><rect width="1280" height="800" fill="#f3f2ef"/>'
                    b'<rect x="64" y="64" width="560" height="64" rx="16" fill="#e2e0db"/></svg>')
            self.send_response(200); self.send_header('Content-Type', 'image/svg+xml'); self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            if self.command != 'HEAD':
                self.wfile.write(body)
            return True
        rel = path.lstrip('/')
        if rel.endswith('.html') and rel != '404.html':
            bare = rel[:-5]
            bare = '' if bare == 'index' else bare[:-6] if bare.endswith('/index') else bare
            self._move('/' + bare + query); return True
        if rel.endswith('/') and rel and (SITE / (rel[:-1] + '.html')).is_file():
            self._move('/' + rel[:-1] + query); return True
        if rel and not rel.endswith('/') and (SITE / (rel + '.html')).is_file():
            self.path = '/' + rel + '.html' + query
            return None
        target = SITE / rel
        if not rel or (target.is_dir() and (target / 'index.html').is_file()) or target.is_file():
            return None
        self._missing(); return True

    def do_GET(self):
        if self._route() is None:
            super().do_GET()

    def do_HEAD(self):
        if self._route() is None:
            super().do_HEAD()

    def list_directory(self, path):  # a folder with no page in it is no page either
        self._missing()
        return None


def serve(port=0):
    """Start serving in the background: (server, the root address with its slash)."""
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Handler, directory=str(SITE)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f'http://127.0.0.1:{server.server_address[1]}/'


if __name__ == '__main__':
    if not (SITE / 'index.html').exists():
        sys.exit('site/ is not built: run python3 tools/build.py && python3 tools/site.py')
    server, url = serve(int(sys.argv[1]) if len(sys.argv) > 1 else 8000)
    print(f'serving site/ at {url} (Ctrl+C to stop)')
    try:
        threading.Event().wait()
    except KeyboardInterrupt:
        server.shutdown()
