import type { User } from "../models";
import api, { type CommonResponse } from "./axios";

export const getUser = async (userId: number): Promise<User> => {
  const { data: response } = await api.get<CommonResponse<User>>(
    `/user/${userId}`,
  );
  return response.data;
};
