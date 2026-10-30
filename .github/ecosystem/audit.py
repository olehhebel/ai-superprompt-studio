#!/usr/bin/env python3
"""Read-only, dependency-free ecosystem audit. Never sends forms or edits sites."""
import argparse
import datetime
import json
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lang = ""
        self.title = ""
        self.in_title = False
        self.description = ""
        self.canonical = []
        self.alternates = {}
        self.h1 = 0
        self.images_missing_alt = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html": self.lang = a.get("lang", "")
        if tag == "title": self.in_title = True
        if tag == "h1": self.h1 += 1
        if tag == "img" and "alt" not in a: self.images_missing_alt += 1
        if tag == "meta" and a.get("name", "").lower() == "description":
            self.description = a.get("content", "").strip()
        if tag == "link":
            rel = a.get("rel", "").split()
            if "canonical" in rel: self.canonical.append(a.get("href", ""))
            if "alternate" in rel and a.get("hreflang"):
                self.alternates[a["hreflang"]] = a.get("href", "")
    def handle_endtag(self, tag):
        if tag == "title": self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title += data

def inspect_html(text, domain):
    p = Page()
    p.feed(text)
    issues = []
    if not p.title.strip(): issues.append("missing title")
    if not p.description: issues.append("missing description")
    if not p.lang: issues.append("missing html lang")
    if p.lang.lower() in ("ua", "ua-ua"): issues.append("use uk language code")
    if p.h1 != 1: issues.append("H1 count: " + str(p.h1))
    if len(p.canonical) != 1: issues.append("canonical count: " + str(len(p.canonical)))
    elif urlparse(p.canonical[0]).hostname != domain:
        issues.append("canonical is not on configured domain")
    if p.images_missing_alt: issues.append("images missing alt: " + str(p.images_missing_alt))
    # Language alternatives require editorial review; do not manufacture translated URLs.
    if not any(x == "uk" or x.startswith("uk-") for x in p.alternates):
        issues.append("review Ukrainian hreflang")
    if not any(x == "en" or x.startswith("en-") for x in p.alternates):
        issues.append("review English hreflang")
    return issues

def fetch(url):
    with urlopen(Request(url, headers={"User-Agent": "OlehHebel-EcosystemAudit/1.0"}), timeout=20) as r:
        return r.status, r.geturl(), r.read(5_000_001).decode("utf-8", errors="replace")

def run(registry, sources, output):
    results = []
    for project in registry["projects"]:
        root = sources / project["id"]
        domain = urlparse(project["url"]).hostname
        result = {"brand": project["brand"], "repository": project["repository"], "pages": [], "live": []}
        if not root.is_dir(): raise RuntimeError("Missing checkout: " + str(root))
        for path in sorted(root.rglob("*.html")):
            if any(part in (".git", "node_modules", "vendor") for part in path.relative_to(root).parts): continue
            result["pages"].append({"path": path.relative_to(root).as_posix(),
                                    "issues": inspect_html(path.read_text(encoding="utf-8", errors="replace"), domain)})
        for resource in ("", "/robots.txt", "/sitemap.xml"):
            url = project["url"].rstrip("/") + resource
            entry = {"url": url}
            try:
                status, final, body = fetch(url)
                entry.update(status=status, final_url=final)
                if resource == "":
                    entry["issues"] = inspect_html(body, domain)
                elif resource == "/sitemap.xml":
                    tree = ElementTree.fromstring(body)
                    entry["urls"] = len(tree.findall(".//{*}loc"))
                    if tree.tag.split("}")[-1] not in ("urlset", "sitemapindex"):
                        entry["error"] = "Not a sitemap"
                else:
                    entry["has_sitemap_directive"] = "sitemap:" in body.lower()
                if urlparse(final).hostname != domain:
                    entry["redirect_review"] = "Final host differs from registry"
            except Exception as exc:
                entry["error"] = str(exc)
            result["live"].append(entry)
        results.append(result)
    output.mkdir(parents=True, exist_ok=True)
    report = {"generated_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "mode": "read-only audit; no AI runtime; no automatic repairs", "projects": results}
    (output / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    lines = ["# Ecosystem audit", "", report["generated_utc"], "", report["mode"], ""]
    for item in results:
        issues = [p for p in item["pages"] if p["issues"]]
        lines += ["## " + item["brand"], "", str(len(item["pages"])) + " HTML files; " +
                  str(len(issues)) + " files requiring review.", ""]
        for live in item["live"]:
            lines.append("- " + live["url"] + ": " + str(live.get("status", live.get("error", "unknown"))))
        lines += ["", "See report.json for every page and live check.", ""]
    (output / "report.md").write_text("\n".join(lines), encoding="utf-8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--registry", default=".github/ecosystem/projects.json")
    parser.add_argument("--sources", default="sources")
    parser.add_argument("--output", default="ecosystem-report")
    args = parser.parse_args()
    run(json.loads(Path(args.registry).read_text()), Path(args.sources), Path(args.output))
