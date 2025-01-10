import { useQuery } from "@tanstack/react-query";
import { findPleskSubscriptionByDomainOptions } from "../../client/@tanstack/react-query.gen";

export const useSubscriptionSearch = (searchTerm) => {
  return useQuery({
    ...findPleskSubscriptionByDomainOptions({ query: { domain: searchTerm } }),
    queryKey: ["subscriptionSearch", searchTerm],
    enabled: !!searchTerm, 
    retry: 0,
    refetchOnWindowFocus: false,
  });
};
