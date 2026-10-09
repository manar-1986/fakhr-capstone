import React from "react";
import { useLocalSearchParams } from "expo-router";
import InstitutionDetailsScreen from "../../../components/directory/InstitutionDetailsScreen";
import { legacyInstitutionId } from "../../../utils/legacyInstitutionRoute";
export default function LegacyDetails() {
  const params = useLocalSearchParams<{ id?: string; school?: string }>();
  const id = legacyInstitutionId(params.id, params.school, false);
  return <InstitutionDetailsScreen institutionId={id} />;
}
