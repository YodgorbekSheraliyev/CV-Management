import type { DashboardData } from "../models";
import api, { type CommonResponse } from "./axios";

export const getDashboard = async () => {
  const { data: response } = await api.get<CommonResponse<DashboardData>>("/dashboard");
  return response.data;
};