// Token blacklist to store invalidated tokens
// In production, use Redis or database instead of in-memory storage
const blacklistedTokens = new Set<string>();

/**
 * Add a token to the blacklist (invalidates the token)
 */
export const addToBlacklist = (token: string): void => {
  blacklistedTokens.add(token);
};

/**
 * Check if a token is blacklisted (invalidated)
 */
export const isBlacklisted = (token: string): boolean => {
  return blacklistedTokens.has(token);
};

/**
 * Remove a token from blacklist (optional - for cleanup)
 */
export const removeFromBlacklist = (token: string): void => {
  blacklistedTokens.delete(token);
};

/**
 * Clear all blacklisted tokens (for testing/cleanup)
 */
export const clearBlacklist = (): void => {
  blacklistedTokens.clear();
};
