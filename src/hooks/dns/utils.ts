export const BASE_OPTIONS = {
  retry: 0,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false
};

export const createQuery = (options, enabled = false) => ({
  ...options,
  ...BASE_OPTIONS,
  enabled: enabled,
});

export const getFirstRecord = (data) => {
  return data?.records?.[0];
};

export const hasExactlyOneRecord = (data) => data?.records?.length === 1;
