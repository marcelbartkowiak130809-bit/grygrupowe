"""Serve the site over localhost with direct links to game pages."""

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
STATIC_DIRS = {"assets", "content", "css", "docs", "functions", "js", "scripts"}


class SiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        request_path = PurePosixPath(unquote(urlsplit(self.path).path).lstrip("/"))
        first_segment = request_path.parts[0] if request_path.parts else ""
        static_page = ROOT.joinpath(*request_path.parts).with_suffix(".html") if request_path.parts else None
        if static_page and static_page.is_file() and static_page.resolve().is_relative_to(ROOT):
            self.path = "/" + static_page.relative_to(ROOT).as_posix()
        elif (
            first_segment
            and first_segment.casefold() not in STATIC_DIRS
            and not any("." in segment for segment in request_path.parts)
            and not Path(self.translate_path(self.path)).exists()
        ):
            self.path = "/index.html"
        return super().send_head()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=49322)
    args = parser.parse_args()
    address = ("127.0.0.1", args.port)
    with ThreadingHTTPServer(address, SiteHandler) as server:
        print(f"Gry grupowe: http://127.0.0.1:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
