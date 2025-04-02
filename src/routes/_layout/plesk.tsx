import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChakraProvider,
  Box,
  VStack,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "../../components/SubscriptionSearch/SearchInput";
import { useSubscriptionSearch } from "../../hooks/plesk/useSubscriptionSearch";
import { useDnsRecords } from "../../hooks/dns/useDnsRecords";
import { useBulkAResolution } from "../../hooks/dns/useBulkAResolution";
import SubscriptionTable from "../../components/SubscriptionSearch/SubscriptionTable";
import { FaServer, FaGlobe, FaEnvelope } from "react-icons/fa";

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
  const { aRecord, mxRecord, zoneMaster, refetchDnsRecords } =
    useDnsRecords(finalSearchTerm);

  // Extract hosts for bulk resolution
  const hosts = useMemo(() => {
    return subscriptionQuery.data?.map((item) => item.host) || [];
  }, [subscriptionQuery.data]);

  const { records, refetch: refetchHostRecords } = useBulkAResolution(hosts);

  // Handle search submission
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setFinalSearchTerm(searchTerm.trim());
      fetchSubscription();
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

        {subscriptionQuery.data && (
          <DnsInfoBar
            finalSearchTerm={finalSearchTerm}
            aRecord={aRecord}
            mxRecord={mxRecord}
            zoneMaster={zoneMaster}
            isLoading={subscriptionQuery.isLoading}
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
              dnsData={{ aRecord, mxRecord, zoneMaster }}
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

const DnsInfoBar = ({ aRecord, mxRecord, zoneMaster, isLoading }) => {
  if (isLoading) return null;

  return (
    <Box
      width="100%"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      boxShadow="sm"
      bg="gray.50"
    >
      <HStack spacing={6} justify="flex-start" flexWrap="wrap">
        <HStack spacing={2}>
          <Icon as={FaGlobe} color="green.500" />
          <Text fontSize="sm" fontWeight="bold">
            A Record:
          </Text>
          <Text fontSize="sm" color="gray.700">
            {aRecord?.ip || "Empty"}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Icon as={FaEnvelope} color="blue.500" />
          <Text fontSize="sm" fontWeight="bold">
            MX Record:
          </Text>
          <Text fontSize="sm" color="gray.700">
            {mxRecord?.ip || "Empty"}
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Icon as={FaServer} color="yellow.500" />
          <Text fontSize="sm" fontWeight="bold">
            ZoneMaster:
          </Text>
          <Text fontSize="sm" color="gray.700">
            {zoneMaster?.ip || "Empty"}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
};
export default SubscriptionSearchApp;
