import {useInternalARecord} from "./useInternalARecord";
import {useInternalMxRecord} from "./useInternalMxRecord";
import {useZoneMaster} from "./useZoneMaster";
import {useGoogleARecord} from "./useGoogleARecord";
import {useGoogleMxRecord} from "./useGoogleMxRecord";
import {usePublicNsRecords} from "./usePublicNsRecords.ts";
import {useAuthoritativeNsRecords} from "./useAuthoritativeNsRecords";
export const useDnsRecords = (searchTerm) => {
    const internalARecord = useInternalARecord(searchTerm);
    const internalMxRecord = useInternalMxRecord(searchTerm);
    const zonemasters = useZoneMaster(searchTerm);
    const googleARecord = useGoogleARecord(searchTerm);
    const googleMxRecord = useGoogleMxRecord(searchTerm);
    const publicNsRecords = usePublicNsRecords(searchTerm);
    const authoritativeNsRecords = useAuthoritativeNsRecords(searchTerm);
    const refetch = () => {
        internalARecord.fetch();
        internalMxRecord.fetch();
        zonemasters.fetch();
        googleARecord.fetch();
        googleMxRecord.fetch();
        publicNsRecords.fetch();
        authoritativeNsRecords.fetch();
    };
    return {
        internalARecord,
        internalMxRecord,
        zonemasters,
        googleARecord,
        googleMxRecord,
        publicNsRecords,
        authoritativeNsRecords,
        refetchDnsRecords: refetch,
    };
};

export * from "./useInternalARecord";
export * from "./useInternalMxRecord";
export * from "./useZoneMaster";
