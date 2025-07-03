import { useQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getZoneMasterFromDnsServersOptions, getPtrRecordOptions } from "../../client/@tanstack/react-query.gen";
import { createQuery } from "./utils";
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

  const zoneMasters = zoneMasterQuery.data?.zone_masters ?? [];

  // Run parallel PTR queries by IP
  const ptrQueries = useQueries({
    queries: zoneMasters.map((master) =>
        createQuery(
            {
              ...getPtrRecordOptions({ query: { ip: master.ip } }),
              queryKey: ["ptrQuery", master.ip],
            },
            !!master.ip
        )
    ),
  });

  const isLoading =
      zoneMasterQuery.isLoading || ptrQueries.some((q) => q.isLoading);

  const error =
      zoneMasterQuery.error || ptrQueries.find((q) => q.error)?.error;

  // Combine original objects with ptr results
  const data = zoneMasters.map((master, idx) => ({
    ...master,
    ptr: ptrQueries[idx]?.data?.records?.[0] ?? null,
  }));
  return {
    zonemasters: data,
    isLoading: zoneMasterQuery.isLoading || ptrQueries.isLoading,
    error: zoneMasterQuery.error || ptrQueries.error,
    fetch: () => setShouldFetch(true),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setShouldFetch(true);
    },
  };
};
