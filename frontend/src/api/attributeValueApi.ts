import type { AttributeValue } from "../models";
import api, { type CommonResponse } from "./axios";

export const getAttributeValuesByUserId = async () => {
  const { data: response } =
    await api.get<CommonResponse<AttributeValue[]>>(`/attributevalue`);
  return response.data;
};

export const createAttributeValue = async (
  attribute: Omit<AttributeValue, "id" | "attribute" | "userId">,
) => {
  const { data: response } = await api.post<CommonResponse<AttributeValue>>(
    `/attributevalue`,
    attribute,
  );
  return response.data;
};

export const updateAttributeValue = async (
  attributeValue: Omit<AttributeValue, "id" | "attribute" | "userId">,
) => {
  const { data: response } = await api.put<CommonResponse<AttributeValue>>(
    `/attributevalue`,
    attributeValue,
  );
  return response.data;
};

export const deleteAttributeValue = async (
  attributeValue: Pick<AttributeValue, "id">,
) => {
  await api.delete<void>(`/attributevalue`, {
    data: attributeValue,
  });
};
