"""
Fast Cached Multi-Threaded Grep Script for AI agents.
"""

import sys
import os
import re
import argparse
import hashlib
import json
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CACHE_DIR = Path("tmp/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def grep_file(file_path: str, pattern_str: str) -> list[dict]:
    regex = re.compile(pattern_str, re.IGNORECASE)
    matches = []
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            for idx, line in enumerate(f, 1):
                if regex.search(line):
                    matches.append({
                        "file": file_path,
                        "line": idx,
                        "match": line.strip()
                    })
    except Exception:
        pass
    return matches


def main():
    parser = argparse.ArgumentParser(description="Fast Cached Grep")
    parser.add_argument("--pattern", type=str, required=True, help="Pattern to search")
    parser.add_argument("--path", type=str, default=".", help="Directory to search")
    parser.add_argument("--ext", type=str, help="Comma separated list of extensions")
    args = parser.parse_args()

    exts = [e.strip().lower() if e.strip().startswith(".") else f".{e.strip().lower()}" for e in args.ext.split(",")] if args.ext else None

    target_files = []
    for root, _, files in os.walk(args.path):
        if "node_modules" in root or ".git" in root or "tmp" in root:
            continue
        for file in files:
            if exts:
                if any(file.lower().endswith(ext) for ext in exts):
                    target_files.append(os.path.join(root, file))
            else:
                target_files.append(os.path.join(root, file))

    all_matches = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(grep_file, f, args.pattern) for f in target_files]
        for f in futures:
            res = f.result()
            if res:
                all_matches.extend(res)

    print(f"Total occurrences: {len(all_matches)}")
    for m in all_matches[:100]:
        print(f"{m['file']}:{m['line']}: {m['match']}")


if __name__ == "__main__":
    main()
