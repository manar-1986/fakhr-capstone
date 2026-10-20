import {planActions} from './planActions';
import { colors } from "./colors";
/** Listing-only presentation shared across both languages. */
export const directoryListing = {
  card: { backgroundColor: colors.white, borderColor: planActions.soft },
  section: { backgroundColor: "#F5F6FC" },
  primary: { backgroundColor: planActions.primary, borderColor: planActions.primary, borderRadius: 24, minHeight: 44, paddingVertical: 8, paddingHorizontal: 12, alignItems: "center" as const, justifyContent: "center" as const },
  primaryText: { color: colors.white },
} as const;
