import api from "./axios";

export interface SalesforceContactForm {
  phone: string | null;
  linkedInUrl: string | null;
  gitHubUrl: string | null;
  notes: string | null;
}

export interface SalesforceResult {
  contactId: string;
}

export const createOrUpdateSalesforceContact = async (
  data: SalesforceContactForm,
): Promise<SalesforceResult> => {
  const response = await api.post("/salesforce/contact", data);

  return response.data.data;
};
