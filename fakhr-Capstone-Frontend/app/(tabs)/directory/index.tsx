import { Redirect } from "expo-router";

/** Keep old bookmarks safe without rendering the retired combined directory. */
export default function LegacyDirectoryRedirect() {
  return <Redirect href="/(tabs)/directory/centers" />;
}
