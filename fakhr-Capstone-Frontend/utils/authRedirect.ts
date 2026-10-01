import type { Href } from "expo-router";

let pendingHref: Href | null = null;

export function setPendingAuthHref(href: Href) {
  pendingHref = href;
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
