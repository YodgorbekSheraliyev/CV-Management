import type { CVSummary, Position, PositionSummary } from "../models";
import api, { type CommonResponse } from "./axios";

export interface PagedPositions {
  items: PositionSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const getPositions = async (search = "", page = 1, pageSize = 10) => {
  const { data: response } = await api.get<CommonResponse<PagedPositions>>(
    "/positions/all",
    {
      params: { search: search || undefined, page, pageSize },
    },
  );
  return response.data;
};

export const getPositionById = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<Position>>(
    `/positions/${positionId}`,
  );
  return response.data;
};

export const createPosition = async (
  position: Pick<Position, "title" | "description" | "maxProjects"> & {
    attributeIds: number[];
    accessRules: unknown[];
    tagIds: number[];
  },
) => {
  const { data: response } = await api.post<CommonResponse<Position>>(
    `/positions`,
    position,
  );
  return response.data;
};

export const updatePosition = async (
  position: Pick<
    Position,
    "id" | "version" | "title" | "description" | "maxProjects"
  > & {
    attributeIds: number[];
    accessRules: unknown[];
    tagIds: number[];
  },
) => {
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
