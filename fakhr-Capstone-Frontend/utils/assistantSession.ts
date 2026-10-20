// Memory only; never serialize conversation data or place it in route parameters.
let owner: string | undefined;
let session: { values: Record<string, unknown> } | undefined;
export function syncAssistantAccount(accountId?: string) {
  if (owner !== accountId || !accountId) { owner = accountId; session = undefined; }
}
export function assistantSession(accountId?: string) {
  syncAssistantAccount(accountId);
  if (!accountId) return { values: {} as Record<string, unknown> };
  return session ??= { values: {} };
}
export function saveAssistantSession(target: ReturnType<typeof assistantSession>, values: Record<string, unknown>) {
  if (session === target) Object.assign(target.values, values);
}
