#!/usr/bin/env python3
"""
Centralized Python Query and Task Execution Wrapper.
===================================================
Provides uniform error interception, structured console logging, and explicit
boolean states (is_success, is_fail) across automation and CI scripts.
"""

from typing import Any, Callable, Dict, Optional
import traceback
import sys


def query_wrapper(operation: Callable[..., Any], *args, **kwargs) -> Dict[str, Any]:
    """
    Executes a callable safely, logging any failure with context and returning
    a structured dictionary containing explicit boolean states.
    """
    try:
        data = operation(*args, **kwargs)
        return {
            "data": data,
            "error": None,
            "is_success": True,
            "is_fail": False,
        }
    except Exception as exc:
        exc_info = traceback.format_exc()
        sys.stderr.write(f"[QueryWrapper Error]: {str(exc)}\n{exc_info}\n")
        return {
            "data": None,
            "error": exc,
            "error_message": str(exc),
            "is_success": False,
            "is_fail": True,
        }
