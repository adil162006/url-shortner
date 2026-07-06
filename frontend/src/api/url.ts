import api from "../lib/axios";
import type { ApiResponse, CreateUrlPayload, UrlItem } from "../types/url.types";

export const getUrlsApi = async (): Promise<UrlItem[]> => {
  const { data } = await api.get<ApiResponse<UrlItem[]>>("/urls");
  return data.data;
};

export const createUrlApi = async (
  payload: CreateUrlPayload
): Promise<UrlItem> => {
  const { data } = await api.post<ApiResponse<UrlItem>>("/urls", payload);
  return data.data;
};