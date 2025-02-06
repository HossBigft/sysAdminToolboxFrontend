export const BASE_OPTIONS = {
  retry: 0,
  refetchOnWindowFocus: false,
};

export const createQuery = (options) => ({
  ...options,
  ...BASE_OPTIONS,
  enabled: true,
});

export const getFirstRecord = (data) => data?.records?.[0];

export const hasExactlyOneRecord = (data) => data?.records?.length === 1;
