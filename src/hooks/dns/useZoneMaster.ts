import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getZoneMasterFromDnsServersOptions } from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord } from "./utils";
import { useQueryClient } from "@tanstack/react-query";

export const useZoneMaster = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const queryKey = ["zoneMasterQuery", domain];
  const zoneMasterQuery = useQuery(
    createQuery(
      {
        ...getZoneMasterFromDnsServersOptions({ query: { name: domain } }),
        queryKey: queryKey,
      },

      shouldFetch && !!domain
    )
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    if (zoneMasterQuery.isError || zoneMasterQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [zoneMasterQuery.error, zoneMasterQuery.isSuccess]);

  const zoneMasterIp = Array.from(
    new Set(zoneMasterQuery.data?.answers?.map((answer) => answer.zone_master))
  );

  return {
    ip: zoneMasterIp,
    isLoading: zoneMasterQuery.isLoading,
    error: zoneMasterQuery.error,
    fetch: () => setShouldFetch(true),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setShouldFetch(true);
    },
  };
};
