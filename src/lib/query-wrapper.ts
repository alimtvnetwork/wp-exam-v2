import { describeError } from "./error-capture";

export enum StatusType {
  Pass = "Pass",
  Fail = "Fail",
}

export interface QueryResponseType<T> {
  isFail: boolean;
  status: StatusType;
  data: T | null;
  error: Error | null;
}

/**
 * executeQuery is a wrapper for queries in TS that automatically logs failures 
 * to reduce scattered logging code, returning an explicit boolean state check (isFail).
 */
export async function executeQuery<T>(
  queryFn: () => Promise<T>,
  context: string
): Promise<QueryResponseType<T>> {
  try {
    const data = await queryFn();
    return {
      isFail: false,
      status: StatusType.Pass,
      data,
      error: null,
    };
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    // console.error is intercepted by error-capture.ts to record and serialize properly.
    console.error(`[QueryWrapper] Error in ${context}:`, errorObj);
    
    return {
      isFail: true,
      status: StatusType.Fail,
      data: null,
      error: errorObj,
    };
  }
}
