
import { useARecord } from "./useARecord";
import { useMxRecord } from "./useMxRecord";
import { useZoneMaster } from "./useZoneMaster";

export const useDnsRecords = (searchTerm) => {
  const aRecord = useARecord(searchTerm);
  const mxRecord = useMxRecord(searchTerm);
  const zoneMaster = useZoneMaster(searchTerm);


  const refetch = () => {
    aRecord.refetch();
    mxRecord.refetch()
    zoneMaster.refetch()
  }
    


  return {
    aRecord,
    mxRecord,
    zoneMaster,
    refetchDnsRecords: refetch
  };
};

export * from "./useARecord";
export * from "./useMxRecord";
export * from "./useZoneMaster";