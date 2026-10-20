// Runs before routing. Never persist or log the reset secret.
let captured: string | undefined;
export function captureResetToken() {
 if (typeof window === "undefined" || window.location?.pathname !== "/reset-password") return;
 const url = new URL(window.location.href);
 // Older emailed query links remain valid; ambiguous mixed sources fail closed.
 const fragment = new URLSearchParams(url.hash.slice(1));
 const values = [...fragment.getAll("token"), ...url.searchParams.getAll("token")];
 captured = values.length === 1 && /^[a-f0-9]{64}$/i.test(values[0]) ? values[0] : "";
 if (typeof document !== "undefined") {
  let meta=document.querySelector<HTMLMetaElement>('meta[name="referrer"]');
  if(!meta){meta=document.createElement("meta");meta.name="referrer";document.head.prepend(meta);}
  meta.content="no-referrer";
 }
 window.history.replaceState(window.history.state, "", url.pathname);
}
export function takeResetToken(): string | undefined { return captured; }
captureResetToken();

export function clearResetToken() { captured = undefined; }

