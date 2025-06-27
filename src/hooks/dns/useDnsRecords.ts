import {useInternalARecord} from "./useInternalARecord";
import {useInternalMxRecord} from "./useInternalMxRecord";
import {useZoneMaster} from "./useZoneMaster";
import {useGoogleARecord} from "./useGoogleARecord";
import {useGoogleMxRecord} from "./useGoogleMxRecord";
import {useGoogleNsRecords} from "./useGoogleNsRecords";
import {useAuthoritativeNsRecords} from "./useAuthoritativeNsRecords";
export const useDnsRecords = (searchTerm) => {
    const internalARecord = useInternalARecord(searchTerm);
    const internalMxRecord = useInternalMxRecord(searchTerm);
    const zoneMaster = useZoneMaster(searchTerm);
    const googleARecord = useGoogleARecord(searchTerm);
    const googleMxRecord = useGoogleMxRecord(searchTerm);
    const googleNsRecords = useGoogleNsRecords(searchTerm);
    const authoritativeNsRecords = useAuthoritativeNsRecords(searchTerm);
    const refetch = () => {
        internalARecord.fetch();
        internalMxRecord.fetch();
        zoneMaster.fetch();
        googleARecord.fetch();
        googleMxRecord.fetch();
        googleNsRecords.fetch();
        authoritativeNsRecords.fetch();
    };

    return {
        internalARecord,
        internalMxRecord,
        zoneMaster,
        googleARecord,
        googleMxRecord,
        googleNsRecords,
        authoritativeNsRecords,
        refetchDnsRecords: refetch,
    };
};

export * from "./useInternalARecord";
export * from "./useInternalMxRecord";
export * from "./useZoneMaster";
