import { useInternalARecord } from "./useInternalARecord";
import { useInternalMxRecord } from "./useInternalMxRecord";
import { useZoneMaster } from "./useZoneMaster";
import { useGoogleARecord } from "./useGoogleARecord";
import { useGoogleMxRecord } from "./useGoogleMxRecord";

export const useDnsRecords = (searchTerm) => {
  const internalARecord = useInternalARecord(searchTerm);
  const internalMxRecord = useInternalMxRecord(searchTerm);
  const zoneMaster = useZoneMaster(searchTerm);
  const googleARecord = useGoogleARecord(searchTerm);
  const googleMxRecord = useGoogleMxRecord(searchTerm);

  const refetch = () => {
    internalARecord.fetch();
    internalMxRecord.fetch();
    zoneMaster.fetch();
    googleARecord.fetch();
    googleMxRecord.fetch();
  };

  return {
    internalARecord,
    internalMxRecord,
    zoneMaster,
    googleARecord,
    googleMxRecord,
    refetchDnsRecords: refetch,
  };
};

export * from "./useInternalARecord";
export * from "./useInternalMxRecord";
export * from "./useZoneMaster";
