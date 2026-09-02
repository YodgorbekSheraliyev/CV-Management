import type { AttributeValue } from "../models";
import api, { type CommonResponse } from "./axios";

export const getAttributeValuesByUserId = async (userId: number) => {
  const { data: response } = await api.get<CommonResponse<AttributeValue[]>>(
    `/attributevalue/${userId}`,
  );
  return response.data;
};

export const createAttributeValue = async (
  attribute: Omit<AttributeValue, "id" | "attribute">,
) => {
  const { data: response } = await api.post<CommonResponse<AttributeValue>>(
    `/attributevalue`,
    attribute,
  );
  return response.data;
};

export const updateAttributeValue = async (
  attribute: Omit<AttributeValue, "attribute">,
) => {
  const { data: response } = await api.post<CommonResponse<AttributeValue>>(
    `/attributevalue`,
    attribute,
  );
  return response.data;
};

export const deleteAttributeValue = async (
  attribute: Pick<AttributeValue, "id">,
) => {
  await api.post<void>(`/attributevalue`, attribute);
};
