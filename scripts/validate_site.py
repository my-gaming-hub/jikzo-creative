#!/usr/bin/env python3
"""Small dependency-free checks for the static JIKZO Creative website."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
SQL_BASE = ROOT / "supabase-setup.sql"
SQL_MARKET = ROOT / "marketplace-upgrade.sql"

class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.anchors = []
        self.labels = []
        self.h1_count = 0
        self.main_count = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        if tag == "a" and attrs.get("href", "").startswith("#"):
            self.anchors.append(attrs["href"][1:])
        if tag == "label" and attrs.get("for"):
            self.labels.append(attrs["for"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "main":
            self.main_count += 1

def fail(message):
    print("FAIL:", message)
    sys.exit(1)

if not HTML.exists():
    fail("index.html is missing")
source = HTML.read_text(encoding="utf-8")
if not source.lstrip().lower().startswith("<!doctype html>"):
    fail("index.html must declare an HTML5 doctype")

audit = Audit()
audit.feed(source)
duplicates = sorted({item for item in audit.ids if audit.ids.count(item) > 1})
if duplicates:
    fail("duplicate static IDs: " + ", ".join(duplicates))
id_set = set(audit.ids)
broken_anchors = sorted({anchor for anchor in audit.anchors if anchor and anchor not in id_set})
if broken_anchors:
    fail("broken in-page links: " + ", ".join(broken_anchors))
broken_labels = sorted({label for label in audit.labels if label not in id_set})
if broken_labels:
    fail("labels point to missing fields: " + ", ".join(broken_labels))
if audit.h1_count != 1:
    fail(f"homepage should contain exactly one h1; found {audit.h1_count}")
if audit.main_count != 1:
    fail(f"homepage should contain exactly one main element; found {audit.main_count}")

scripts = re.findall(r"<script\\b[^>]*>([\\s\\S]*?)</script>", source, flags=re.I)
if len(scripts) != 1:
    fail(f"expected one inline application script; found {len(scripts)}")
Path("/tmp/jikzo-inline.js").write_text(scripts[0], encoding="utf-8")

for path in (SQL_BASE, SQL_MARKET):
    if not path.exists():
        fail(f"{path.name} is missing")
market = SQL_MARKET.read_text(encoding="utf-8").lower()
for table in ("orders", "services", "reviews"):
    if f"alter table public.{table} enable row level security" not in market:
        fail(f"row-level security is not enabled for {table}")
    if f"create policy" not in market:
        fail("database migration is missing access policies")
base = SQL_BASE.read_text(encoding="utf-8").lower()
for table in ("user_roles", "enquiries"):
    if f"alter table public.{table} enable row level security" not in base:
        fail(f"row-level security is not enabled for {table}")

print("PASS: HTML structure, static IDs, internal links, labels, inline script extraction and database RLS checks.")
