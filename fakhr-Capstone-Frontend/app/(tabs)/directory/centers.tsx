import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

// Preserve old Centers links and their disability/navigation context.
export default function Screen() {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: "/(tabs)/directory/professionals", params: { ...params, tab: "centers" } }} />;
}
