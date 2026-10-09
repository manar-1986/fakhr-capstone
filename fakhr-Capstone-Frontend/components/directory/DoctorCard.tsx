import React from "react";
import { DirectoryListingCard, type ListingCardProps } from "./DirectoryListingCard";

/** Doctor / specialist listing card — same layout as {@link DirectoryListingCard}. */
export function DoctorCard(props: ListingCardProps) {
  return <DirectoryListingCard {...props} />;
}
