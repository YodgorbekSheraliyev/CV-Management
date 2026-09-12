import { type CV, type CVSummary } from "../models";
import api, { type CommonResponse } from "./axios";

interface UpdateCvAttributeValueInput {
  cvId: number;
  attributeValueId: number;
  value: string;
}

interface PublishCvInput {
  id: number;
  userId: number;
}

export const getAllCvs = async () => {
  const { data: response } =
    await api.get<CommonResponse<CVSummary[]>>("cvs/all");
  return response.data;
};

export const getCvsByUserId = async (userId: number) => {
  const { data: response } = await api.get<CommonResponse<CVSummary[]>>(
    `/cvs/user/${userId}`,
  );
  return response.data;
};

export const createCv = async (positionId: number, userId: number) => {
  const { data: response } = await api.post<CommonResponse<CV>>("/cvs", {
    positionId,
    userId,
  });
  return response.data;
};

export const getCvById = async (id: number, userId: number) => {
  const { data: response } = await api.get<CommonResponse<CV>>(
    `/cvs/${id}/${userId}`,
  );
  return response.data;
};

export const updateCvAttributeValue = async (
  input: UpdateCvAttributeValueInput,
  userId: number,
) => {
  const { data: response } = await api.put<CommonResponse<CV>>(
    `/cvs/attribute-values/${userId}`,
    input,
  );
  return response.data;
};

export const publishCv = async ({ id, userId }: PublishCvInput) => {
  const { data: response } = await api.put<CommonResponse<CV>>("/cvs/publish", {
    id,
    userId,
  });
  return response.data;
};

export const deleteCv = async (id: number, userId: number) => {
  await api.delete<void>("/cvs", { data: { id, userId } });
};

export const getCvsByPosition = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<CVSummary[]>>(
    `/positions/${positionId}/cvs`,
  );
  return response.data;
};
