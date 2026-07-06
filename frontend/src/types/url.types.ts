export interface UrlItem {
  id: string;
  title: string;
  orignalUrl: string;
  shortCode: string;
  createdAt: string;
  userId: string;
}

export interface CreateUrlPayload {
  title: string;
  orignalUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}