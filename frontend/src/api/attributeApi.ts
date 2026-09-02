import type { Attribute } from "../models";
import api, { type CommonResponse } from "./axios";

export const getAttributes = async () => {
  const { data: response } =
    await api.get<CommonResponse<Attribute[]>>("/attribute/all");
  return response.data;
};

export const getAttributeById = async (id: number) => {
  const { data: response } = await api.get<CommonResponse<Attribute>>(
    `/attribute/${id}`,
  );
  return response.data;
};
export const createAttribute = async (
  attribute: Omit<Attribute, "id" | "isBuiltIn">,
) => {
  const { data: response } = await api.post<CommonResponse<Attribute>>(
    `/attribute`,
    attribute,
  );
  return response.data;
};

export const updateAttribute = async (
  attribute: Omit<Attribute, "isBuiltIn">,
) => {
  const { data: response } = await api.put<CommonResponse<Attribute>>(
    `/attribute`,
    attribute,
  );
  return response.data;
};

export const deleteAttribute = async (attribute: Pick<Attribute, "id">) => {
  await api.delete<void>(`/attribute`, {
    data: attribute,
  });
};
