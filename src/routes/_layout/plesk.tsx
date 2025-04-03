import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChakraProvider,
  Box,
  VStack,
  Text,
  HStack,
  Icon,
  useColorModeValue,
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

  // Color values that will change depending on the color mode
  const bgColor = useColorModeValue("gray.50", "gray.700"); // Light: gray.50, Dark: gray.700
  const textColor = useColorModeValue("gray.700", "gray.200"); // Light: gray.700, Dark: gray.200
  const iconColorA = useColorModeValue("green.500", "green.300");
  const iconColorB = useColorModeValue("blue.500", "blue.300");
  const iconColorC = useColorModeValue("yellow.500", "yellow.300");

  return (
    <Box
      width="100%"
      p={4}
      borderRadius="md"
      borderWidth="1px"
      boxShadow="sm"
      bg={bgColor} // Use color mode-aware bg color
    >
      <HStack spacing={6} justify="flex-start" flexWrap="wrap">
        <HStack spacing={2}>
          <Icon as={FaGlobe} color={iconColorA} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            A Record:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {aRecord?.ptr || aRecord?.ip || "Empty"}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Icon as={FaEnvelope} color={iconColorB} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            MX Record:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {mxRecord?.ptr ||mxRecord?.ip || "Empty"}
          </Text>
        </HStack>

        <HStack spacing={2}>
          <Icon as={FaServer} color={iconColorC} />
          <Text fontSize="sm" fontWeight="bold" color={textColor}>
            ZoneMaster:
          </Text>
          <Text fontSize="sm" color={textColor}>
            {zoneMaster?.ip || "Empty"}
          </Text>
        </HStack>
      </HStack>
    </Box>
  );
};
export default SubscriptionSearchApp;
