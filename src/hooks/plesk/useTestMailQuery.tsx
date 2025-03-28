import { useQuery } from "@tanstack/react-query";
import { createTestmailForDomainOptions } from "../../client/@tanstack/react-query.gen";

export const useTestMailQuery = (clickedItem, domain) => {
    return useQuery({
      ...createTestmailForDomainOptions({
        query: { server: clickedItem?.host, maildomain: domain },
      }),
      queryKey: ["testMailLoginLink", domain],
      enabled: false, // We'll manually trigger this
      refetchOnWindowFocus: false,
      staleTime: 5 * (60 * 1000), // 5 mins
    });
  };