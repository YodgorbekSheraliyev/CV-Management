import type { AdminUser, User } from "../models";
import api, { type CommonResponse } from "./axios";

interface UpdateUser {
  version: number;
  firstName: string;
  lastName: string;
  location: string;
}

export const getUser = async (userId: number): Promise<User> => {
  const { data: response } = await api.get<CommonResponse<User>>(
    `/user/${userId}`,
  );
  return response.data;
};

export const updateUser = async (updateUser: UpdateUser) => {
  const { data: response } = await api.put<CommonResponse<User>>(
    `/user`,
    updateUser,
  );
  return response.data;
};

export const getAdminUsers = async () => {
  const { data: response } = await api.get<CommonResponse<AdminUser[]>>("/user/admin/all");
  return response.data;
};

export const updateAdminUserRole = async (userId: number, role: number, version: number) => {
  const { data: response } = await api.put<CommonResponse<AdminUser>>("/user/admin/role", {
    userId,
    role,
    version,
  });
  return response.data;
};

export const updateAdminUserBlock = async (userId: number, isBlocked: boolean, version: number) => {
  const { data: response } = await api.put<CommonResponse<AdminUser>>("/user/admin/block", {
    userId,
    isBlocked,
    version,
  });
  return response.data;
};

export const deleteAdminUser = async (userId: number) => {
  await api.delete(`/user/admin/${userId}`);
};
