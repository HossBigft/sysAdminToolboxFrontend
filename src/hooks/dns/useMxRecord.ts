// src/hooks/dns/useMxRecord.js
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import {
  getMxRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createQuery, getFirstRecord, hasExactlyOneRecord } from "./utils";

export const useMxRecord = (domain) => {
  const [shouldFetch, setShouldFetch] = useState(false);

  const mxRecordQuery = useQuery(
    createQuery(getMxRecordOptions({ query: { domain } }), !!domain && shouldFetch)
  );

  useEffect(() => {
      if (mxRecordQuery.isError || mxRecordQuery.isSuccess) {
        setShouldFetch(false);
      }
    }, [mxRecordQuery.error, mxRecordQuery.isSuccess]);

  const mxRecord = getFirstRecord(mxRecordQuery.data);

  return {
    record: mxRecord,
    fetch: () => setShouldFetch(true)
  };
};
