import { type CV, type CVSummary } from "../models";
import api, { type CommonResponse } from "./axios";

export interface CreateCvInput {
  positionId: number;
}

export interface UpdateCvAttributeValueInput {
  cvId: number;
  attributeId: number;
  value: string;
}

export const getMyCvs = async () => {
  const { data: response } = await api.get<CommonResponse<CVSummary[]>>("/cvs");
  return response.data;
};

export const createCv = async (positionId: number) => {
  const { data: response } = await api.post<CommonResponse<CV>>("/cvs", {
    positionId,
  });
  return response.data;
};

export const getCvById = async (id: number) => {
  const { data: response } = await api.get<CommonResponse<CV>>(`/cvs/${id}`);
  return response.data;
};

export const updateCvAttributeValue = async (
  input: UpdateCvAttributeValueInput,
) => {
  const { data: response } = await api.put<CommonResponse<CV>>(
    "/cvs/attribute-values",
    input,
  );
  return response.data;
};

export const publishCv = async (id: number) => {
  const { data: response } = await api.post<CommonResponse<CV>>(
    `/cvs/${id}/publish`,
  );
  return response.data;
};

export const deleteCv = async (id: number) => {
  await api.delete<void>("/cvs", { data: { id } });
};

export const getCvsByPosition = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<CV[]>>(
    `/positions/${positionId}/cvs`,
  );
  return response.data;
};
