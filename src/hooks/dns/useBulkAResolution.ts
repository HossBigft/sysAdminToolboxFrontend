import { useQueries } from "@tanstack/react-query";
import { useMemo, useEffect, useState } from "react";

import { getARecordOptions } from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord } from "./utils";

export function useBulkAResolution(domains = []) {
  const [shouldFetch, setShouldFetch] = useState(false);

  const hostQueries = useQueries({
    queries: domains.map((domain) =>
      createQuery(
        {
          ...getARecordOptions({ query: { name: domain } }),
          queryKey: ["ResolveA", domain],
        },
        !!domains && shouldFetch
      )
    ),
  });

  const domainsRecords = useMemo(() => {
    const recordMap = {};

    domains.forEach((domain, index) => {
      if (hostQueries[index]?.data) {
        recordMap[domain] = getFirstRecord(hostQueries[index].data);
      }
    });

    return recordMap;
  }, [domains, hostQueries]);

  useEffect(() => {
    const hasError = hostQueries.some((query) => query.isError);
    const allSuccess = hostQueries.every((query) => query.isSuccess);

    if (hasError || allSuccess) {
      setShouldFetch(false);
    }
  }, [hostQueries]);

  return {
    records: domainsRecords,
    isLoading: hostQueries.some((q) => q.isLoading),
    isError: hostQueries.some((q) => q.isError),
    refetch: () => {
      setShouldFetch(true);
    },
  };
}
