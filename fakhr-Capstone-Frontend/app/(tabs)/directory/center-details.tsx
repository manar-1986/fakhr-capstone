import React from "react";
import { useLocalSearchParams } from "expo-router";
import InstitutionDetailsScreen from "../../../components/directory/InstitutionDetailsScreen";
import { legacyInstitutionId } from "../../../utils/legacyInstitutionRoute";
export default function LegacyDetails() {
  const params = useLocalSearchParams<{ id?: string; listing?: string }>();
  const id = legacyInstitutionId(params.id, params.listing, true);
  return <InstitutionDetailsScreen institutionId={id} />;
}
