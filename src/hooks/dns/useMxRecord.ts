// src/hooks/dns/useMxRecord.js
import { useQuery } from "@tanstack/react-query";
import {
  getMxRecordOptions,
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useMxRecord = (domain, enabled = true) => {
  const mxRecordQuery = useQuery(
    createQuery(getMxRecordOptions({ query: { domain } }), enabled)
  );

  const mxRecord = getFirstRecord(mxRecordQuery.data);

  const aRecordQuery = useQuery(
    createQuery(
      getARecordOptions({ query: { domain: mxRecord } }),
      !!mxRecord && hasExactlyOneRecord(mxRecordQuery.data)
    )
  );

  const aRecord = getFirstRecord(aRecordQuery.data);

  const ptrQuery = useQuery(
    createQuery(
      getPtrRecordOptions({ query: { ip: aRecord } }),
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
    refetch: mxRecordQuery.refetch
  };
};
