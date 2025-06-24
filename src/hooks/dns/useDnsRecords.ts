import { useInternalARecord } from "./useInternalARecord";
import { useInternalMxRecord } from "./useInternalMxRecord";
import { useZoneMaster } from "./useZoneMaster";

export const useDnsRecords = (searchTerm) => {
  const aRecord = useInternalARecord(searchTerm);
  const mxRecord = useInternalMxRecord(searchTerm);
  const zoneMaster = useZoneMaster(searchTerm);

  const refetch = () => {
    aRecord.fetch();
    mxRecord.fetch();
    zoneMaster.fetch();
  };

  return {
    aRecord,
    mxRecord,
    zoneMaster,
    refetchDnsRecords: refetch,
  };
};

export * from "./useInternalARecord";
export * from "./useInternalMxRecord";
export * from "./useZoneMaster";
