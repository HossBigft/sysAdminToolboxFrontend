import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getARecordOptions } from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord } from "./utils";

export const useARecord = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const aRecordQuery = useQuery(
    createQuery(
      {
        ...getARecordOptions({ query: { name: domain } }),
        queryKey: ["aRecordQuery", domain],
      },
      !!domain && shouldFetch
    )
  );

  useEffect(() => {
    if (aRecordQuery.isError || aRecordQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [aRecordQuery.error, aRecordQuery.isSuccess]);

  const aRecord = getFirstRecord(aRecordQuery.data);

  return {
    ip: aRecord,
    isLoading: aRecordQuery.isLoading,
    error: aRecordQuery.error,
    fetch: () => setShouldFetch(true),
  };
};
