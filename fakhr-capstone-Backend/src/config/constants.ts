export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_ID: "Invalid ID format",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden access",
  VALIDATION_ERROR: "Validation error",
  DUPLICATE_ENTRY: "Resource already exists",
  INTERNAL_ERROR: "Internal server error",
} as const;

export const USER_ROLES = {
  PARENT: "parent",
  ADMIN: "admin",
  PROFESSIONAL: "professional",
} as const;
