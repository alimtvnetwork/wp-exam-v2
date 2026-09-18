"""
Shared Engine for AI high-performance exploration scripts.
"""

import sys
import os
import re
from enum import Enum
from pathlib import Path

# Ensure UTF-8 stdout across all platforms
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

CACHE_DIR = Path("tmp/cache")
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class RegexPatternType(Enum):
    MarkdownHeaders = r"^#{1,6}\s+(.+)$"
    EnumDefinition = r"enum\s+([A-Za-z0-9_]+)"
    TypeDefinition = r"(?:type|interface)\s+([A-Za-z0-9_]+)"
    FunctionDefinition = r"(?:function|const|let)\s+([A-Za-z0-9_]+)\s*="
    CodeRedProhibition = r"(?:CODE\s+RED|STRICTLY\s+AVOID|FORBIDDEN)"


_COMPILED_PATTERNS = {}


def get_compiled_regex(pattern_type: RegexPatternType) -> re.Pattern:
    """Lazy regex memoization."""
    if pattern_type not in _COMPILED_PATTERNS:
        _COMPILED_PATTERNS[pattern_type] = re.compile(pattern_type.value, re.MULTILINE)
    return _COMPILED_PATTERNS[pattern_type]
