import type { CVSummary, Position, PositionSummary } from "../models";
import api, { type CommonResponse } from "./axios";

export const getPositions = async () => {
  const { data: response } =
    await api.get<CommonResponse<PositionSummary[]>>("/positions/all");
  return response.data;
};

export const getPositionById = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<Position>>(
    `/positions/${positionId}`,
  );
  return response.data;
};

export const createPosition = async (position: Omit<Position, "id">) => {
  const { data: response } = await api.post<CommonResponse<Position>>(
    `/positions`,
    position,
  );
  return response.data;
};

export const updatePosition = async (position: Position) => {
  const { data: response } = await api.put<CommonResponse<Position>>(
    `/positions`,
    position,
  );
  return response.data;
};

export const deletePosition = async (position: Pick<Position, "id">) => {
  await api.delete<void>("/positions", { data: position });
};

export const duplicatePosition = async (positionId: number) => {
  const { data: response } = await api.post<CommonResponse<Position>>(
    `/positions/${positionId}/duplicate`,
  );
  return response.data;
};

export const getPositionCvs = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<CVSummary[]>>(
    `/positions/${positionId}/cvs`,
  );
  return response.data;
};
