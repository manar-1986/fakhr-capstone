import { Redirect } from "expo-router";

/** Old green Manage Children screen — keep the route but always use the current Fakhr child profile. */
export default function ManageChildrenScreen() {
  return <Redirect href="/(tabs)/profile/edit-child-profile" />;
}
