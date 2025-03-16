import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getMxRecordOptions,
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useMxRecord = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const mxRecordQuery = useQuery(
    createQuery(
      {
        ...getMxRecordOptions({ query: { name: domain } }),
        queryKey: ["mxRecordQuery", domain],
      },
      shouldFetch && !!domain
    )
  );

  useEffect(() => {
    if (mxRecordQuery.isError || mxRecordQuery.isSuccess) {
      setShouldFetch(false);
    }
  }, [mxRecordQuery.error, mxRecordQuery.isSuccess]);

  const mxRecord = getFirstRecord(mxRecordQuery.data);

  const aRecordQuery = useQuery(
    createQuery(
      {
        ...getARecordOptions({ query: { name: mxRecord } }),
        queryKey: ["aRecordQuery", mxRecord],
      },
      !!mxRecord && hasExactlyOneRecord(mxRecordQuery.data)
    )
  );

  const aRecord = getFirstRecord(aRecordQuery.data);

  const ptrQuery = useQuery(
    createQuery(
      {
        ...getPtrRecordOptions({ query: { ip: aRecord } }),
        queryKey: ["ptrQuery", aRecord],
      },
      !!aRecord && hasExactlyOneRecord(aRecordQuery.data)
    )
  );

  return {
    record: mxRecord,
    ip: aRecord,
    ptr: ptrQuery?.data?.records?.[0],
    isLoading:
      mxRecordQuery.isLoading || aRecordQuery.isLoading || ptrQuery.isLoading,
    error: mxRecordQuery.error || aRecordQuery.error || ptrQuery.error,
    fetch: () => setShouldFetch(true),
  };
};
