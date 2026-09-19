import type { Router } from "expo-router";

export function firstSearchParam(value?: string | string[]): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Explicit return to the selected-disability services hub (avoids broken tab/web history). */
export function navigateToDisabilityServices(
  router: Pick<Router, "navigate">,
  disabilityId: string,
  disabilityName?: string,
) {
  router.navigate({
    pathname: "/(tabs)/resources/disability-services",
    params: {
      id: disabilityId,
      name: disabilityName ?? "",
    },
  });
}

export function tryNavigateToDisabilityServices(
  router: Pick<Router, "navigate">,
  params: {
    disabilityId?: string | string[];
    disabilityName?: string | string[];
  },
): boolean {
  const disabilityId = firstSearchParam(params.disabilityId);
  if (!disabilityId) return false;
  navigateToDisabilityServices(
    router,
    disabilityId,
    firstSearchParam(params.disabilityName),
  );
  return true;
}
