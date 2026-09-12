import type { User } from "../models";
import api, { type CommonResponse } from "./axios";

interface UpdateUser {
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

export const updateUser = async (userId: number, updateUser: UpdateUser) => {
  const { data: response } = await api.put<CommonResponse<User>>(
    `/user/${userId}`,
    updateUser,
  );
  return response.data;
};
