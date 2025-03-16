import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  getZoneMasterFromDnsServersOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery } from "./utils";

export const useZoneMaster = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const zoneMasterQuery = useQuery(
    createQuery(
      {
        ...getZoneMasterFromDnsServersOptions({ query: { name: domain } }),
        queryKey: ["zoneMasterQuery", domain],
      },

      shouldFetch && !!domain
    )
  );

  useEffect(() => {
    if (zoneMasterQuery.isError || zoneMasterQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [zoneMasterQuery.error, zoneMasterQuery.isSuccess]);

  const zoneMasterIp = Array.from(
    new Set(zoneMasterQuery.data?.answers?.map((answer) => answer.zone_master))
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
  };
};
