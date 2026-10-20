import type { Href } from "expo-router";

let pendingHref: Href | null = null;

export const ACCOUNT_REQUIRED_HREF: Href = "/(auth)/login";

export function setDefaultAuthHref(href: Href) {
  pendingHref ??= href;
}

export function setPendingAuthHref(href: Href) {
  pendingHref = isAuthFlowPath(typeof href === "string" ? href : href.pathname) ? null : href;
}

export function consumePendingAuthHref(): Href | null {
  const next = pendingHref;
  pendingHref = null;
  return next;
}

export function finishAuthRedirect(router: { replace: (href: Href) => void }) {
  const next = consumePendingAuthHref();
  router.replace(next ?? "/(tabs)/home");
}

export function bookingReturnHref(item?: string | string[]): Href {
  const raw = Array.isArray(item) ? item[0] : item;
  if (raw) {
    return {
      pathname: "/(tabs)/directory/booking",
      params: { item: raw },
    };
  }
  return "/(tabs)/directory/booking";
}

/** Preserve the destination through recovery/registration, but forget it on cancellation. */
export function isAuthFlowPath(path: string): boolean {
 const clean = path.replace(/\/\([^/]+\)/g, "").split(/[?#]/)[0];
 return ["/login", "/forgot-password", "/reset-password", "/create-account", "/privacy-policy", "/terms-conditions"].includes(clean);
}
export function clearCancelledAuthDestination(previousPath: string, currentPath: string) {
 if (isAuthFlowPath(previousPath) && !isAuthFlowPath(currentPath)) pendingHref = null;
}
