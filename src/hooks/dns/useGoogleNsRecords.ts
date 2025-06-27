import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {
    getNsRecordsGoogleOptions
} from "../../client/@tanstack/react-query.gen";
import {createQuery} from "./utils";

export const useGoogleNsRecords = (domain) => {
    const [shouldFetch, setShouldFetch] = useState(false);
    const googleNsRecordsQuery = useQuery(
        createQuery(
            {
                ...getNsRecordsGoogleOptions({query: {name: domain}}),
                queryKey: ["googleNsRecordsQuery", domain],
            },
            shouldFetch && !!domain
        )
    );

    useEffect(() => {
        if (googleNsRecordsQuery.isError || googleNsRecordsQuery.isSuccess) {
            setShouldFetch(false);
        }
    }, [googleNsRecordsQuery.error, googleNsRecordsQuery.isSuccess]);


    return {
        nsRecords: googleNsRecordsQuery.data,
        isLoading:
        googleNsRecordsQuery.isLoading,
        error: googleNsRecordsQuery.error,
        fetch: () => setShouldFetch(true),
    };
};
