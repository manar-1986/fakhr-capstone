import instance from "./axios";

export interface ContentResource {
  id: string;
  title: string;
  content: string;
}

/**
 * Get all content resources (NOT IMPLEMENTED IN BACKEND)
 * GET /api/content/resources
 */
export const getResources = async (): Promise<ContentResource[] | null> => {
  // This endpoint is not implemented in the backend yet
  console.warn("Content resources endpoint is not implemented in the backend");
  return null;
};

/**
 * Get content details by ID (NOT IMPLEMENTED IN BACKEND)
 * GET /api/content/:contentId
 */
export const getContentDetails = async (
  contentId: string
): Promise<ContentResource | null> => {
  // This endpoint is not implemented in the backend yet
  console.warn("Content details endpoint is not implemented in the backend");
  return null;
};
