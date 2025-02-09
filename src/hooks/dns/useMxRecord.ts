// src/hooks/dns/useMxRecord.js
import { useQuery } from "@tanstack/react-query";
import {
  getMxRecordOptions,
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useMxRecord = (domain) => {
  const mxRecordQuery = useQuery(
    createQuery(getMxRecordOptions({ query: { domain } }), !!domain)
  );

  const mxRecord = getFirstRecord(mxRecordQuery.data);

  return {
    record: mxRecord,
    refetch: mxRecordQuery.refetch
  };
};
