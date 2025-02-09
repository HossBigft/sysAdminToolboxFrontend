import { useQuery } from "@tanstack/react-query";
import {
  getARecordOptions,
  getPtrRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useARecord = (domain) => {
  console.log('useARecord called with domain:', domain);
  
  const aRecordQuery = useQuery(
    createQuery(getARecordOptions({ query: { domain } }))
  );
  
  console.log('aRecordQuery state:', aRecordQuery.status);
  
  const aRecord = getFirstRecord(aRecordQuery.data);

  return {
    ip: aRecord,
    refetch: aRecordQuery.refetch,
  };
};
