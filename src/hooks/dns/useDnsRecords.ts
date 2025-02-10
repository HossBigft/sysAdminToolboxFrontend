
import { useARecord } from "./useARecord";
import { useMxRecord } from "./useMxRecord";
import { useZoneMaster } from "./useZoneMaster";

export const useDnsRecords = (searchTerm) => {
  const aRecord = useARecord(searchTerm);
  const mxRecord = useMxRecord(searchTerm);
  const zoneMaster = ()=>{};
  // const mxRecord = ()=>{};
  // const zoneMaster = ()=>{};


  const refetch = async () => {
    console.log("Global refetch triggered")
    aRecord.fetch()
    console.log("arecord value in usedns hook", aRecord)
    mxRecord.fetch()
    // await zoneMaster.refetch()
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