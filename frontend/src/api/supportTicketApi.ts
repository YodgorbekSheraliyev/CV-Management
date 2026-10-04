import api, { type CommonResponse } from "./axios";

export type SupportTicketPriority = "High" | "Average" | "Low";

export interface CreateSupportTicket {
  summary: string;
  priority: SupportTicketPriority;
  link: string;
}

export const createSupportTicket = async (ticket: CreateSupportTicket) => {
  const { data: response } = await api.post<CommonResponse<string>>(
    "/supporttickets",
    ticket,
  );

  return response.data;
};
