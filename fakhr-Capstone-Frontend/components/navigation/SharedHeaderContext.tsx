import React, { createContext, useCallback, useContext, useRef } from "react";
import { useFocusEffect } from "expo-router";
export const SharedHeaderContext = createContext<{ managed: boolean; backAction: React.MutableRefObject<(() => void) | null> } | null>(null);
/** Only step-based forms override Back; ordinary pages use the router's actual stack. */
export function StepBackAction({ action }: { action: () => void }) {
  const header = useContext(SharedHeaderContext);
  const latest = useRef(action); latest.current = action;
  useFocusEffect(useCallback(() => {
    if (!header) return;
    const callback = () => latest.current();
    header.backAction.current = callback;
    return () => { if (header.backAction.current === callback) header.backAction.current = null; };
  }, [header]));
  return null;
}
