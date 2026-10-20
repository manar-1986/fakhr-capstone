export function validResetToken(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{64}$/i.test(value); }
export function passwordBytes(value: string): number { return Array.from(value).reduce((n,c) => n + ((c.codePointAt(0) ?? 0) > 65535 ? 4 : c.charCodeAt(0) > 2047 ? 3 : c.charCodeAt(0) > 127 ? 2 : 1), 0); }
export function validNewPassword(value: string): boolean { return value.length >= 6 && passwordBytes(value) <= 72; }
export function resetErrorKind(error: unknown): "expired" | "limited" | "network" {
 const status = (error as {status?: number})?.status;
 return status === 400 ? "expired" : status === 429 ? "limited" : "network";
}
