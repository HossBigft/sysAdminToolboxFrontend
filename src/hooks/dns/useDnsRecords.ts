
import { useARecord } from "./useARecord";
import { useMxRecord } from "./useMxRecord";
import { useZoneMaster } from "./useZoneMaster";

export const useDnsRecords = (searchTerm) => {


  return {
    aRecord: useARecord(searchTerm),
    mxRecord: useMxRecord(searchTerm),
    zoneMaster: useZoneMaster(searchTerm),
  };
};

export * from "./useARecord";
export * from "./useMxRecord";
export * from "./useZoneMaster";