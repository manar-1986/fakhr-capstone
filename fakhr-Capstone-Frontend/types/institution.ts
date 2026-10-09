export type InstitutionCategory = "school" | "nursery" | "rehabilitation";

/** A transcription, not a claim of current operation or admission eligibility. */
export type InstitutionObservation = {
  sourceId: string;
  page: number;
  row: string;
  nameAr: string;
  governorateAr: string | null;
  areaAr: string | null;
  addressAr: string | null;
  phones: string[];
  needsAr: string | null;
  stagesAr: string | null;
  classroomAr: string | null;
  capacityAr: string | null;
  agesAr: string | null;
};

export type Institution = {
  /** Permanent identity; never an array offset, phone number, or translated name. */
  id: string;
  nameAr: string;
  nameEn?: string | null;
  categories: InstitutionCategory[];
  observations: InstitutionObservation[];
  reviewStatus: "unverified";
  reviewNotesAr: string[];
  disabilityTags: string[];
  stageTags: string[];
  verifiedMapUrl?: string | null;
  mapVerification?: { verifiedAt: string; evidence: string };
  sourceExtras?: Record<string, string>;
  origin?: "legacy" | "backend";
};
