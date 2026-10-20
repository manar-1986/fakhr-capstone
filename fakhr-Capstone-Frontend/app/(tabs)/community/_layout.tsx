import { Redirect } from "expo-router";
import React from "react";

/**
 * Community is no longer exposed in the app. Guard the entire route subtree,
 * including saved links to posts/composer/advice, without mounting its screens
 * or changing any stored content or backend endpoints.
 */
export default function CommunityStackLayout() {
  return <Redirect href="/(tabs)/home" />;
}
