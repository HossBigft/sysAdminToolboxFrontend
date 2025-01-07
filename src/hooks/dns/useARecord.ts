import { useQuery } from "@tanstack/react-query";
import {
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useARecord = (domain, enabled = true) => {
  const aRecordQuery = useQuery(
    createQuery(getARecordOptions({ query: { domain } }), enabled)
  );

  const aRecord = getFirstRecord(aRecordQuery.data);

  const ptrQuery = useQuery(
    createQuery(
      getPtrRecordOptions({ query: { ip: aRecord } }),
      !!aRecord && hasExactlyOneRecord(aRecordQuery.data)
    )
  );

  return {
    ip: aRecord,
    ptr: ptrQuery.data?.records?.[0],
    isLoading: aRecordQuery.isLoading || ptrQuery.isLoading,
    error: aRecordQuery.error || ptrQuery.error,
  };
};
