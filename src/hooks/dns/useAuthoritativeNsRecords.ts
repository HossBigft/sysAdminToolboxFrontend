import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {
    getAuthoritativeNsRecordsOptions
} from "../../client/@tanstack/react-query.gen";
import {createQuery} from "./utils";

export const useAuthoritativeNsRecords = (domain) => {
    const [shouldFetch, setShouldFetch] = useState(false);
    const authoritativeNsRecordsQuery = useQuery(
        createQuery(
            {
                ...getAuthoritativeNsRecordsOptions({query: {name: domain}}),
                queryKey: ["authoritativeNsRecordsQuery", domain],
            },
            shouldFetch && !!domain
        )
    );

    useEffect(() => {
        if (authoritativeNsRecordsQuery.isError || authoritativeNsRecordsQuery.isSuccess) {
            setShouldFetch(false);
        }
    }, [authoritativeNsRecordsQuery.error, authoritativeNsRecordsQuery.isSuccess]);


    return {
        authoritativeNsRecords: authoritativeNsRecordsQuery.data,
        isLoading:
        authoritativeNsRecordsQuery.isLoading,
        error: authoritativeNsRecordsQuery.error,
        fetch: () => setShouldFetch(true),
    };
};
