import { type Application } from "../models";
import api, { type CommonResponse } from "./axios";

export const getAllApplications = async () => {
  const { data: response } = await api.get<CommonResponse<Application[]>>("/applications/all");
  return response.data;
};
