import { type CV, type CVSummary } from "../models";
import api, { type CommonResponse } from "./axios";

interface UpdateCvAttributeValueInput {
  cvId: number;
  version: number;
  attributeId: number;
  value: string;
}

export const getAllCvs = async () => {
  const { data: response } =
    await api.get<CommonResponse<CVSummary[]>>("cvs/all");
  return response.data;
};

export const getCvsByCurrentUser = async () => {
  const { data: response } =
    await api.get<CommonResponse<CVSummary[]>>(`/cvs/user`);
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
    `/cvs/attribute-values`,
    input,
  );
  return response.data;
};

export const publishCv = async (id: number, version: number) => {
  const { data: response } = await api.put<CommonResponse<CV>>("/cvs/publish", {
    id,
    version,
  });
  return response.data;
};

export const deleteCv = async (id: number, version: number) => {
  await api.delete<void>("/cvs", { data: { id, version } });
};

export const getCvsByPosition = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<CVSummary[]>>(
    `/positions/${positionId}/cvs`,
  );
  return response.data;
};

export const likeCv = async (id: number) => {
  const { data: response } = await api.post<CommonResponse<CV>>(
    `/cvs/like/${id}`,
  );
  return response.data;
};

export const unlikeCv = async (id: number) => {
  const { data: response } = await api.delete<CommonResponse<CV>>(
    `/cvs/unlike/${id}`,
  );
  return response.data;
};
