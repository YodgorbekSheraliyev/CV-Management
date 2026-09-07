import type { Position, PositionSummary } from "../models";
import api, { type CommonResponse } from "./axios";

export const getPositions = async () => {
  const { data: response } =
    await api.get<CommonResponse<PositionSummary[]>>("/positions/all");
  return response.data;
};

export const getPositionById = async (positionId: number, userId: number) => {
  const { data: response } = await api.get<CommonResponse<Position>>(
    `/positions/${positionId}/${userId}`,
  );
  return response.data;
};

export const createPosition = async (
  position: Omit<Position, "id">,
  userId: number,
) => {
  const { data: response } = await api.post<CommonResponse<Position>>(
    `/positions/${userId}`,
    position,
  );
  return response.data;
};

export const updatePosition = async (position: Position, userId: number) => {
  const { data: response } = await api.put<CommonResponse<Position>>(
    `/positions/${userId}`,
    position,
  );
  return response.data;
};

export const deletePosition = async (position: Pick<Position, "id">) => {
  await api.delete<void>("/positions", { data: position });
};

export const duplicatePosition = async (positionId: number, userId: number) => {
  const { data: response } = await api.post<CommonResponse<Position>>(
    `/positions/${positionId}/duplicate/${userId}`,
  );
  return response.data;
};
