
import { useARecord } from "./useARecord";
import { useMxRecord } from "./useMxRecord";
import { useZoneMaster } from "./useZoneMaster";

export const useDnsRecords = (searchTerm, triggerSearch) => {
  const enabled = triggerSearch && !!searchTerm;
  
  return {
    aRecord: useARecord(searchTerm, enabled),
    mxRecord: useMxRecord(searchTerm, enabled),
    zoneMaster: useZoneMaster(searchTerm, enabled),
  };
};

export * from "./useARecord";
export * from "./useMxRecord";
export * from "./useZoneMaster";