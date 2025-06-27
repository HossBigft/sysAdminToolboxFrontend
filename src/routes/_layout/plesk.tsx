import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChakraProvider, Box, VStack, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "../../components/SubscriptionSearch/SearchInput";
import { useSubscriptionSearch } from "../../hooks/plesk/useSubscriptionSearch";
import { useDnsRecords } from "../../hooks/dns/useDnsRecords";
import { useBulkInternalAResolution } from "../../hooks/dns/useBulkInternalAResolution.ts";
import SubscriptionTable from "../../components/SubscriptionSearch/SubscriptionTable";
import DnsInfoBar from "../../components/SubscriptionSearch/DnsInfoBar";

export const Route = createFileRoute("/_layout/")({
  component: SubscriptionSearchApp,
});

function SubscriptionSearchApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [finalSearchTerm, setFinalSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData(["currentUser"]);

  // API hooks
  const { subscriptionQuery, fetchSubscription } =
    useSubscriptionSearch(finalSearchTerm);
  const { internalARecord, internalMxRecord, googleARecord, googleMxRecord, zoneMaster, googleNsRecords, authoritativeNsRecords, refetchDnsRecords } =
    useDnsRecords(finalSearchTerm);
  // Extract hosts for bulk resolution
  const hosts = useMemo(() => {
    return subscriptionQuery.data?.map((item) => item.host?.name) || [];
  }, [subscriptionQuery.data]);

  const { records, refetch: refetchHostRecords } = useBulkInternalAResolution(hosts);

  // Handle search submission
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setFinalSearchTerm(searchTerm.trim());
      fetchSubscription();
      refetchHostRecords();
      refetchDnsRecords();
    }
  };

  // Refetch data when search term or subscription data changes
  useEffect(() => {
    if (finalSearchTerm && subscriptionQuery.data) {
      refetchHostRecords();
      refetchDnsRecords();
    }
  }, [finalSearchTerm, subscriptionQuery.data]);

  return (
    <ChakraProvider>
      <VStack
        spacing={4}
        width="100%"
        margin="50px auto"
        maxWidth={["80%", "70%", "60%", "1200px"]}
        px={[2, 4, 6, 0]}
      >
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          isDisabled={subscriptionQuery.isLoading}
        />

        {finalSearchTerm && (
          <DnsInfoBar
            finalSearchTerm={finalSearchTerm}
            internalARecord={internalARecord}
            internalMxRecord={internalMxRecord}
            googleARecord={googleARecord}
            googleMxRecord={googleMxRecord}
            zoneMaster={zoneMaster}
            nsRecords={googleNsRecords}
            authoritativeNsRecords={authoritativeNsRecords}
          />
        )}
        {subscriptionQuery.isLoading && <Text>Loading...</Text>}
        {subscriptionQuery.error && (
          <Text color="red.500">Error: {subscriptionQuery.error.message}</Text>
        )}
        {subscriptionQuery.data && (
          <Box overflowX="auto" width="100%" maxWidth="100%">
            <SubscriptionTable
              subscriptionData={subscriptionQuery.data}
              dnsData={{ internalARecord, internalMxRecord, zoneMaster }}
              hostRecords={records}
              searchTerm={finalSearchTerm}
              currentUser={currentUser}
            />
          </Box>
        )}
      </VStack>
    </ChakraProvider>
  );
}

export default SubscriptionSearchApp;
