import {useQuery} from "@tanstack/react-query";
import {useEffect, useState} from "react";
import {
    getPublicNsPropagationOptions
} from "../../client/@tanstack/react-query.gen";
import {createQuery} from "./utils";

export const usePublicNsRecords = (domain) => {
    const [shouldFetch, setShouldFetch] = useState(false);
    const publicNsRecordsQuery = useQuery(
        createQuery(
            {
                ...getPublicNsPropagationOptions({query: {name: domain}}),
                queryKey: ["", domain],
            },
            shouldFetch && !!domain
        )
    );

    useEffect(() => {
        if (publicNsRecordsQuery.isError || publicNsRecordsQuery.isSuccess) {
            setShouldFetch(false);
        }
    }, [publicNsRecordsQuery.error, publicNsRecordsQuery.isSuccess]);

    return {
        records: publicNsRecordsQuery.data ?? [],
        isLoading:
        publicNsRecordsQuery.isLoading,
        error: publicNsRecordsQuery.error,
        fetch: () => setShouldFetch(true),
    };
};
