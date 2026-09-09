import api, { type CommonResponse } from "./axios";
import type { Tag } from "../models";

export interface CreateTagDto {
  name: string;
}

export const getAllTags = async () => {
  const { data: response } = await api.get<CommonResponse<Tag[]>>("/tags/all");
  return response.data;
};

export const getTagByName = async (name: string) => {
  const { data: response } = await api.get<CommonResponse<Tag>>(
    `/tags/${name}`,
  );
  return response.data;
};

export const createTag = async (tag: Pick<Tag, "name">) => {
  const { data: response } = await api.post<CommonResponse<Tag>>("/tags", tag);

  return response.data;
};
