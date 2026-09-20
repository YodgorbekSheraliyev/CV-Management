import { type Post } from "../models";
import api, { type CommonResponse } from "./axios";

export const getAllPosts = async (positionId: number) => {
  const { data: response } = await api.get<CommonResponse<Post[]>>(
    `/posts/all/${positionId}`,
  );
  return response.data;
};

export const createPost = async (post: Omit<Post, "id" | "createdAt">) => {
  const { data: response } = await api.post<CommonResponse<Post>>(
    `/posts`,
    post,
  );
  return response.data;
};

export const updatePost = async (post: Post) => {
  const { data: response } = await api.put<CommonResponse<Post>>(
    `/posts`,
    post,
  );
  return response.data;
};

export const deletePost = async (id: number) => {
  await api.delete(`/posts`, {
    data: { id },
  });
};
