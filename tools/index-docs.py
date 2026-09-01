#!/usr/bin/env python3
"""Index site/docs HTML into site/docs/search.json.

Usage:
    python3 tools/index-docs.py

Walks site/docs/**/*.html, strips script/style, writes an array of
{url, title, description, headings, text}.
"""
import json, os, re
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = os.path.join(ROOT, "site")
DOCS = os.path.join(SITE, "docs")
OUT = os.path.join(DOCS, "search.json")

SKIP_TAGS = {"script", "style", "noscript", "nav", "footer", "svg", "form"}
SKIP_CLASS = {"docs-bar", "skip"}
CONTENT_TAGS = {"main", "header"}
HEADING_TAGS = {"h1", "h2", "h3", "h4", "h5", "h6"}
BLOCK_TAGS = CONTENT_TAGS | HEADING_TAGS | {
    "p", "li", "div", "section", "article", "br", "pre", "ol", "ul"
}


class DocParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title_parts = []
        self.description = ""
        self.headings = []
        self.body = []
        self._skip = 0
        self._in_title = False
        self._in_content = 0
        self._heading = None

    def handle_starttag(self, tag, attrs):
        ad = dict(attrs)
        classes = ad.get("class", "").split()
        if self._skip:
            self._skip += 1
            return
        if tag in SKIP_TAGS or SKIP_CLASS.intersection(classes):
            self._skip = 1
            return
        if tag == "meta" and ad.get("name") == "description":
            self.description = ad.get("content", "")
        if tag == "title":
            self._in_title = True
        if tag in CONTENT_TAGS:
            self._in_content += 1
        if tag in HEADING_TAGS and self._in_content:
            self._heading = []
        if tag in BLOCK_TAGS and self._in_content:
            self.body.append(" ")

    def handle_endtag(self, tag):
        if self._skip:
            self._skip -= 1
            return
        if tag == "title":
            self._in_title = False
        if tag in HEADING_TAGS and self._heading is not None:
            text = norm("".join(self._heading))
            if text:
                self.headings.append(text)
            self._heading = None
        if tag in CONTENT_TAGS and self._in_content:
            self._in_content -= 1
        if tag in BLOCK_TAGS and self._in_content:
            self.body.append(" ")

    def handle_data(self, data):
        if self._skip:
            return
        if self._in_title:
            self.title_parts.append(data)
        if self._heading is not None:
            self._heading.append(data)
        if self._in_content:
            self.body.append(data)


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def page_url(path):
    rel = os.path.relpath(path, SITE).replace(os.sep, "/")
    if rel.endswith("/index.html"):
        rel = rel[: -len("index.html")]
    elif rel.endswith(".html"):
        rel = rel[: -len(".html")] + "/"
    return "/" + rel


def parse(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    p = DocParser()
    p.feed(raw)
    p.close()
    return {
        "url": page_url(path),
        "title": norm("".join(p.title_parts)),
        "description": norm(p.description),
        "headings": p.headings,
        "text": norm("".join(p.body)),
    }


def html_pages():
    found = []
    for root, dirs, files in os.walk(DOCS):
        dirs.sort()
        for name in sorted(files):
            if name.endswith(".html"):
                found.append(os.path.join(root, name))
    return found


def main():
    records = [parse(p) for p in html_pages()]
    records.sort(key=lambda r: r["url"])
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("%d pages → %s" % (len(records), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
