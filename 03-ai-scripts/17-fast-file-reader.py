"""
Fast Cached File and Directory Reader for AI agents.
"""

import sys
import os
import re
import argparse
import hashlib
import json
from pathlib import Path

# Strict UTF-8 encoding
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Optional shared engine import
try:
    from . import shared_engine  # type: ignore
except Exception:
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("shared_engine", Path(__file__).parent / "02-shared-engine.py")
        if spec and spec.loader:
            shared_engine = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(shared_engine)
        else:
            shared_engine = None
    except Exception:
        shared_engine = None

CACHE_DIR = Path("tmp/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def get_cache_path(key: str) -> Path:
    hashed = hashlib.sha256(key.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"fast_read_{hashed}.json"


def list_folder(folder_path: str, extensions: list[str] | None = None) -> list[str]:
    cache_key = f"list:{folder_path}:{','.join(sorted(extensions or []))}"
    cpath = get_cache_path(cache_key)
    
    p = Path(folder_path)
    if not p.exists():
        return []
        
    mtime = p.stat().st_mtime
    if cpath.exists():
        try:
            with open(cpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("mtime") == mtime and "files" in data:
                    return data["files"]
        except Exception:
            pass

    ext_set = {e.lower() if e.startswith(".") else f".{e.lower()}" for e in extensions} if extensions else None
    results = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            if ext_set:
                if any(file.lower().endswith(ext) for ext in ext_set):
                    results.append(os.path.normpath(os.path.join(root, file)))
            else:
                results.append(os.path.normpath(os.path.join(root, file)))

    try:
        with open(cpath, "w", encoding="utf-8") as f:
            json.dump({"mtime": mtime, "files": results}, f)
    except Exception:
        pass

    return results


def read_file(file_path: str, max_bytes: int | None = None) -> str:
    p = Path(file_path)
    if not p.exists() or not p.is_file():
        return f"[ERROR] File not found: {file_path}"

    mtime = p.stat().st_mtime
    cache_key = f"read:{file_path}:{max_bytes}"
    cpath = get_cache_path(cache_key)

    if cpath.exists():
        try:
            with open(cpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("mtime") == mtime and "content" in data:
                    return data["content"]
        except Exception:
            pass

    with open(p, "r", encoding="utf-8", errors="replace") as f:
        content = f.read(max_bytes) if max_bytes else f.read()

    try:
        with open(cpath, "w", encoding="utf-8") as f:
            json.dump({"mtime": mtime, "content": content}, f)
    except Exception:
        pass

    return content


def search_pattern(pattern: str, search_path: str = ".") -> list[dict]:
    regex = re.compile(pattern, re.IGNORECASE)
    results = []
    
    for root, _, files in os.walk(search_path):
        if "node_modules" in root or ".git" in root or "tmp" in root:
            continue
        for file in files:
            fpath = os.path.join(root, file)
            try:
                with open(fpath, "r", encoding="utf-8", errors="replace") as f:
                    for i, line in enumerate(f, 1):
                        if regex.search(line):
                            results.append({
                                "file": os.path.normpath(fpath),
                                "line": i,
                                "content": line.strip()
                            })
            except Exception:
                pass
    return results


def main():
    parser = argparse.ArgumentParser(description="Fast Cached File & Folder Reader")
    parser.add_argument("--list-folder", type=str, help="Folder path to list")
    parser.add_argument("--ext", type=str, help="Comma separated list of extensions")
    parser.add_argument("--read-file", type=str, help="File path to read")
    parser.add_argument("--max-bytes", type=int, default=None, help="Max bytes to read")
    parser.add_argument("--search-pattern", type=str, help="Regex pattern to search")
    parser.add_argument("--path", type=str, default=".", help="Directory to search pattern in")
    
    args = parser.parse_args()

    if args.list_folder:
        exts = [e.strip() for e in args.ext.split(",")] if args.ext else None
        files = list_folder(args.list_folder, exts)
        print(f"Total files found: {len(files)}")
        for f in files:
            print(f)
    elif args.read_file:
        content = read_file(args.read_file, args.max_bytes)
        print(content)
    elif args.search_pattern:
        matches = search_pattern(args.search_pattern, args.path)
        print(f"Total matches found: {len(matches)}")
        for m in matches[:50]:
            print(f"{m['file']}:{m['line']} -> {m['content']}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
