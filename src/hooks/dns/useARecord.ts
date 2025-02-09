import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useARecord = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  console.log("useARecord called with domain:", domain);

  const aRecordQuery = useQuery(
    createQuery(
      getARecordOptions({ query: { domain } }),
      !!domain && shouldFetch
    )
  );

  useEffect(() => {
    if (aRecordQuery.isError || aRecordQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [aRecordQuery.error, aRecordQuery.isSuccess]);

  
  useEffect(() => {
    console.log("Updated Fetch Status:", shouldFetch);
  }, [shouldFetch]);
  console.log("aRecordQuery state:", aRecordQuery.status);

  const aRecord = getFirstRecord(aRecordQuery.data);

  return {
    ip: aRecord,
    fetch: () => setShouldFetch(true),
  };
};
