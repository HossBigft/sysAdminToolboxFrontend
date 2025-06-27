import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";

import {getARecordOptions, getPtrRecordOptions} from "../../client/@tanstack/react-query.gen";
import {createQuery, getFirstRecord} from "./utils";

export const useInternalARecord = (domain) => {
    const [shouldFetch, setShouldFetch] = useState(false);

    const aRecordQuery = useQuery(
        createQuery(
            {
                ...getARecordOptions({query: {name: domain}}),
                queryKey: ["internalARecordQuery", domain],
            },
            !!domain && shouldFetch
        )
    );


    useEffect(() => {
        if (aRecordQuery.isError || aRecordQuery.isSuccess) {
            setShouldFetch(false);
        }
    }, [aRecordQuery.error, aRecordQuery.isSuccess]);

    const aRecord = getFirstRecord(aRecordQuery.data);


    const ptrQuery = useQuery(
        createQuery(
            {
                ...getPtrRecordOptions({query: {ip: aRecord}}),
                queryKey: ["ptrQuery", aRecord],
            },
            !!aRecord
        )
    )


    return {
        ip: aRecord,
        ptr: ptrQuery.data?.records?.[0],
        isLoading: aRecordQuery.isLoading || ptrQuery.isLoading,
        error: aRecordQuery.error || ptrQuery.error,
        fetch: () => setShouldFetch(true),
    };
};
