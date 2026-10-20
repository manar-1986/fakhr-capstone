import React from "react";
import type { Institution } from "../../types/institution";
import { educationProfile } from "../../utils/educationProfile";
import CenterProfileScreen from "./CenterProfileScreen";
export default function EducationProfileScreen({item}:{item:Institution}) {
  return <CenterProfileScreen item={educationProfile(item)} educationKind={item.categories.includes("nursery") ? "nursery" : "school"}/>;
}
