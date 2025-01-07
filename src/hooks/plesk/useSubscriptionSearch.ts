import { useQuery, useQueryClient } from '@tanstack/react-query';
import { findPleskSubscriptionByDomainOptions } from '../../client/@tanstack/react-query.gen';

export const useSubscriptionSearch = (searchTerm, triggerSearch) => {
  const queryClient = useQueryClient();

  return useQuery({
    ...findPleskSubscriptionByDomainOptions({ query: { domain: searchTerm } }),
    queryKey: ['subscriptionSearch', searchTerm],
    enabled: triggerSearch && !!searchTerm,
    retry: 0,
    refetchOnWindowFocus: false,
  });
};