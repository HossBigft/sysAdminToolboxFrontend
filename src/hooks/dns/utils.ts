export const BASE_OPTIONS = {
  retry: 0,
  refetchOnWindowFocus: false,
};

export const createQuery = (options, enabled = true) => ({
  ...options,
  ...BASE_OPTIONS,
  enabled,
});

export const getFirstRecord = (data) => data?.records?.[0];

export const hasExactlyOneRecord = (data) => data?.records?.length === 1;

