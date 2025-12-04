/**
 * Shared utility types used across the application
 */

/**
 * Generic action result wrapper for server actions
 * @template T - The type of data returned on success
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Paginated result wrapper for list queries
 * @template T - The type of items in the list
 */
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};