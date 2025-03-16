import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { findPleskSubscriptionByDomainOptions } from "../../client/@tanstack/react-query.gen";

export const useSubscriptionSearch = (searchTerm) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const subscriptionQuery = useQuery({
    ...findPleskSubscriptionByDomainOptions({ query: { name: searchTerm } }),
    queryKey: ["subscriptionSearch", searchTerm],
    enabled: shouldFetch && !!searchTerm,
    retry: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (subscriptionQuery.isError || subscriptionQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [subscriptionQuery.error, subscriptionQuery.isSuccess]);

  return { subscriptionQuery, fetchSubscription: () => setShouldFetch(true) };
};
