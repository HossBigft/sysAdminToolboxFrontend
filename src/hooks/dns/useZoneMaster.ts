import { useQuery, useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getZoneMasterFromDnsServersOptions, resolveHostByIpOptions} from "../../client/@tanstack/react-query.gen";
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
  const resolveHostQueries = useQueries({
    queries: zoneMasters.map((master) =>
        createQuery(
            {
              ...resolveHostByIpOptions({ query: { ip: master.ip } }),
              queryKey: ["resolveHostQuery", master.ip],
            },
            !!master.ip
        )
    ),
  });

  const isLoading =
      zoneMasterQuery.isLoading || resolveHostQueries.some((q) => q.isLoading);

  const error =
      zoneMasterQuery.error || resolveHostQueries.find((q) => q.error)?.error;


  const data = zoneMasters.map((master, idx) => ({
    ...master,
    ptr: resolveHostQueries[idx]?.data?.name ?? null,
  }));
  return {
    zonemasters: data,
    isLoading: zoneMasterQuery.isLoading || resolveHostQueries.isLoading,
    error: zoneMasterQuery.error || resolveHostQueries.error,
    fetch: () => setShouldFetch(true),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setShouldFetch(true);
    },
  };
};
