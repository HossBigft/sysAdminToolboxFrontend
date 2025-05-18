import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getZoneMasterFromDnsServersOptions, getPtrRecordOptions } from "../../client/@tanstack/react-query.gen";
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
    new Set(zoneMasterQuery.data?.zone_masters?.map((answer) => answer.ip))
  );

  const ptrQuery = useQuery(
    createQuery(
      {
        ...getPtrRecordOptions({ query: { ip: zoneMasterIp[0] } }),
        queryKey: ["ptrQuery", zoneMasterIp[0]],
      },
      !!zoneMasterIp && zoneMasterIp.length === 1
    )
  );

  return {
    ip: zoneMasterIp,
    ptr: ptrQuery.data?.records?.[0],
    isLoading: zoneMasterQuery.isLoading || ptrQuery.isLoading,
    error: zoneMasterQuery.error || ptrQuery.error,
    fetch: () => setShouldFetch(true),
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
      setShouldFetch(true);
    },
  };
};
