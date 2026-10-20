import instance from "./axios";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
}

/**
 * Get current authenticated user's profile
 * GET /api/users/me
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await instance.get<UserResponse>("/users/me");
  // axios interceptor returns response.data directly, so response is already the UserResponse object
  return (response as unknown as UserResponse).data.user;
};

/**
 * Update user profile
 * PUT /api/users/:userId
 */
export const updateUser = async (
  userId: string,
  data: { name?: string; email?: string }
): Promise<User> => {
  const response = await instance.put<UserResponse>(`/users/${userId}`, data);
  // axios interceptor returns response.data directly, so response is already the UserResponse object
  return (response as unknown as UserResponse).data.user;
};
