import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUrlApi, getUrlsApi } from "../api/url";
import type { CreateUrlPayload, UrlItem } from "../types/url.types";

export const urlKeys = {
  all: ["urls"] as const,
};

export const useUrls = () => {
  return useQuery<UrlItem[]>({
    queryKey: urlKeys.all,
    queryFn: getUrlsApi,
    staleTime: 30_000,
  });
};

export const useCreateUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUrlPayload) => createUrlApi(payload),
    onSuccess: (newUrl) => {
      // Optimistically drop the new item straight into the cache instead of
      // waiting on a refetch — feels instant in the modal -> list flow.
      queryClient.setQueryData<UrlItem[]>(urlKeys.all, (old) =>
        old ? [newUrl, ...old] : [newUrl]
      );
    },
  });
};