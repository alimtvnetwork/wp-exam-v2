/**
 * TypeScript / Frontend Storage & Query Wrapper with Explicit Boolean States.
 * Standardizes async fetch and local database queries with automated error logging.
 */

export interface QueryResult<T> {
  isSuccess: boolean;
  isFail: boolean;
  data: T | null;
  errorMessage: string | null;
  contextSql: string;
}

export const createSuccessResult = <T>(data: T, contextSql: string = ''): QueryResult<T> => ({
  isSuccess: true,
  isFail: false,
  data,
  errorMessage: null,
  contextSql,
});

export const createFailureResult = <T>(errorMessage: string, contextSql: string = ''): QueryResult<T> => ({
  isSuccess: false,
  isFail: true,
  data: null,
  errorMessage,
  contextSql,
});

/**
 * Safely executes an asynchronous query or storage operation with automated error logging.
 */
export async function executeQuery<T>(
  operation: () => Promise<T>,
  contextSql: string = ''
): Promise<QueryResult<T>> {
  try {
    const data = await operation();
    return createSuccessResult(data, contextSql);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[QueryWrapper] Database operation failed: ${errorMsg}`, { contextSql });
    return createFailureResult<T>(errorMsg, contextSql);
  }
}
