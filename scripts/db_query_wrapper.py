#!/usr/bin/env python3
"""
Python Database Query Wrapper with Structured Boolean States.
=============================================================
Provides safe execution for sqlite3 and database connections with automated
logging and explicit is_success / is_fail states.
"""

from dataclasses import dataclass
import logging
import sqlite3
from typing import Any, Callable, Optional, Sequence, Union

logger = logging.getLogger("WpExam.Database")


@dataclass
class QueryResult:
    """Standardized database query result container."""
    is_success: bool
    is_fail: bool
    data: Any
    error_message: Optional[str]
    sql: str

    @classmethod
    def success(cls, data: Any = None, sql: str = "") -> "QueryResult":
        return cls(
            is_success=True,
            is_fail=False,
            data=data,
            error_message=None,
            sql=sql
        )

    @classmethod
    def failure(cls, error_message: str, sql: str = "") -> "QueryResult":
        return cls(
            is_success=False,
            is_fail=True,
            data=None,
            error_message=error_message,
            sql=sql
        )


def execute_query(
    conn: sqlite3.Connection,
    sql: str,
    params: Sequence[Any] = (),
    is_commit: bool = False
) -> QueryResult:
    """Executes a SQL query safely and returns a structured QueryResult."""
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        
        if is_commit:
            conn.commit()
            data = cursor.rowcount
        else:
            data = cursor.fetchall()
            
        return QueryResult.success(data=data, sql=sql)
    except Exception as exc:
        error_msg = str(exc)
        logger.error("Database query failed: %s | SQL: %s", error_msg, sql)
        return QueryResult.failure(error_message=error_msg, sql=sql)


def execute_callable(
    conn: sqlite3.Connection,
    callback: Callable[[sqlite3.Connection], Any],
    context_sql: str = ""
) -> QueryResult:
    """Executes an arbitrary database callable safely with error catching."""
    try:
        data = callback(conn)
        return QueryResult.success(data=data, sql=context_sql)
    except Exception as exc:
        error_msg = str(exc)
        logger.error("Database transaction failed: %s | Context: %s", error_msg, context_sql)
        return QueryResult.failure(error_message=error_msg, sql=context_sql)
