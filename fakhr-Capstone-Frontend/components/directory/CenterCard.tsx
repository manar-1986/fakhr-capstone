import React from "react";
import { DirectoryListingCard, type ListingCardProps } from "./DirectoryListingCard";

/** Center listing card — same layout as {@link DirectoryListingCard}. */
export function CenterCard(props: ListingCardProps) {
  return <DirectoryListingCard {...props} />;
}
