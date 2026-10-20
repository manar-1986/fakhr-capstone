export type InstitutionCategory = "school" | "nursery" | "rehabilitation" | "sports";

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
  galleryPhotos?: ("al-bayan-building" | "conductive-rehabilitation-building")[];
  mainImage?: "novaforte" | "warba" | "kscd" | "altomooh" | "speakup" | "communicate" | "specialreem" | "letsspeech" | "dima" | "somya" | "littlefingers" | "insan" | "ghali" | "eek" | "yanmo" | "darabdullah" | "bestdream" | "alamal" | "jackjill" | "almaha" | "specialsmart" | "alnowair" | "alheba" | "sunshine" | "royalbritish" | "milestone" | "maharat" | "baytalatfal" | "alghad" | "nada" | "baitnasser" | "kuwaitdream" | "albustan" | "amebs" | "dyslexia" | "ican" | "crehbuilding" | "idad" | "ksh" | "alekhlas" | "center21" | "kuwaitacademygirls" | "ccis" | "khalifa" | "manarat" | "bayanbuilding" | "knes" | "uca" | "kuwaitenglish" | "alsafwa" | "gulfspecial" | "ajyalbuilding" | "alhudabuilding" | "conductiveeducation" | "ummhanibuilding" | "alnukhba" | "aljaber" | "nibrasspecial" | "modernkuwait" | "reyada" | "kuwaithelp" | "alnoor" | "futurebilingual" | "ummalqura" | "resala" | "maarifa" | "kuwait-autism-building" | "abc" | "qudrat" | "kcld" | "roa" | "firststep" | "speechplus" | "hope" | "thiqa" | "maram" | "kdc" | "initials" | "sila" | "ccet" | "hopeschool" | "dasman" | "futurepioneers" | "speakclinic" | "shahad";
  /** Exact, researched identities used to reconcile existing API records, never fuzzy matches. */
  identityAliases?: string[];
  canonicalId?: string;
  branches?: Institution[];
  /** Only source-supported public fields. Evidence stays in the internal research file. */
  publicProfile?: {
    classification?: { ar: string; en: string };
    description?: { ar: string; en: string };
    additionalServices?: { ar: string[]; en: string[] };
    services?: { ar: string[]; en: string[] };
    associatedSpecialists?: { ar: string[]; en: string[] };
    instagramLabel?: { ar: string; en: string };
    additionalUrlLabel?: { ar: string; en: string };
    specialization?: { ar: string; en: string };
    additionalPhoneLabel?: { ar: string; en: string };
    supportedConditions?: { ar: string[]; en: string[] };
    extraPhones?: { phone: string; label: { ar: string; en: string } }[];
    email?: string;
    established?: number;
    supervisors?: { ar: string[]; en: string[] };
    ages?: { ar: string; en: string };
    area?: { ar: string; en: string };
    governorate?: { ar: string; en: string };
    address?: { ar: string; en: string };
    phone?: string;
    phoneExtension?: string;
    additionalPhone?: string;
    whatsapp?: { phone?: string; url: string };
    branchLocations?: { branchId: string; name: { ar: string; en: string }; mapUrl?: string; address?: { ar: string; en: string }; verificationNote?: { ar: string; en: string }; whatsapp?: { phone: string; url: string } }[];
    mapUrl?: string;
    instagram?: string;
    website?: string;
    localizedWebsite?: { ar: string; en: string };
    additionalUrl?: string;
    rating?: { value: number; count?: number; verifiedAt: string; evidence: string };
  };
  /** Supplied contact information, separate from source verification history. */
  publicContact?: { phone: string; mapUrl: string; provenance: "user-provided" };
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
