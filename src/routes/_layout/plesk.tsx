import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChakraProvider,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Text,
  Button,
  HStack,
  Badge,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "../../components/SubscriptionSearch/SearchInput";
import HostCell from "../../components/SubscriptionSearch/HostCell";
import DomainsList from "../../components/SubscriptionSearch/DomainsList";
import { useSubscriptionSearch } from "../../hooks/plesk/useSubscriptionSearch";
import { useDnsRecords } from "../../hooks/dns/useDnsRecords";
import { useBulkAResolution } from "../../hooks/dns/useBulkAResolution";
import useSubscriptionLoginLink from "../../hooks/plesk/useSubscriptionLoginLink";
import useCreateTestMail from "../../hooks/plesk/useCreateTestMail";
import useSetZoneMaster from "../../hooks/plesk/useSetZoneMaster";
import { FaExclamationTriangle } from "react-icons/fa";
import SubscriptionTable from "../../components/SubscriptionSearch/SubscriptionTable";

export const Route = createFileRoute("/_layout/")({
  component: SubscriptionSearchApp,
});

// Constants extracted for better maintainability
const STATUS_COLOR_MAPPING = {
  online: "green",
  subscription_is_disabled: "yellow",
  domain_disabled_by_admin: "red",
  domain_disabled_by_client: "orange",
};

const STATUS_DISPLAY_MAPPING = {
  online: "Online",
  subscription_is_disabled: "Subscription Disabled",
  domain_disabled_by_admin: "Disabled by Admin",
  domain_disabled_by_client: "Disabled by Client",
};

// Table columns configuration for better readability and maintenance
const COLUMNS = [
  { id: "host", label: "Host", width: "15%" },
  { id: "name", label: "Name", width: ["10%", "7%", "5%"] },
  { id: "status", label: "Status", width: ["10%", "7%", "5%"] },
  { id: "id", label: "ID", width: ["10%", "7%", "5%"] },
  { id: "username", label: "Username", width: ["10%", "7%", "5%"] },
  { id: "domains", label: "Domains", width: "5%" },
  { id: "size", label: "Size", width: ["10%", "8%", "8%"] },
  {
    id: "actions",
    label: "Actions",
    width: ["15%", "18%", "15%"],
    align: "center",
  },
];

function SubscriptionSearchApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clickedItem, setClickedItem] = useState(null);
  const [finalSearchTerm, setFinalSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData(["currentUser"]);

  // API hooks
  const { subscriptionQuery, fetchSubscription } =
    useSubscriptionSearch(finalSearchTerm);
  const { aRecord, mxRecord, zoneMaster, refetchDnsRecords } =
    useDnsRecords(finalSearchTerm);
  const { fetch: fetchLoginLink } = useSubscriptionLoginLink(clickedItem);
  const { mutateZoneMaster, isSuccess, isError, error } = useSetZoneMaster();
  const { fetch: fetchTestMailCredentials } = useCreateTestMail(
    clickedItem,
    finalSearchTerm
  );

  const toast = useToast();
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: `Zonemaster successfully set to ${clickedItem?.host}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [isSuccess, clickedItem, toast]);

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error",
        description: `Failed to set zonemaster: ${error.message || "Unknown error"}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [isError, error, toast]);

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

  // Set clicked item for action hooks
  const handleItemAction = (item) => {
    setClickedItem(item);
  };

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
              onItemAction={handleItemAction}
            />
          </Box>
        )}
      </VStack>
    </ChakraProvider>
  );
}

// Create a new component for DNS information display
const DnsInfoBar = ({ aRecord, mxRecord, zoneMaster, isLoading }) => {
  if (isLoading) return null;

  return (
    <Box width="100%" p={4} borderRadius="md" borderWidth="1px" boxShadow="sm">
      <HStack spacing={8} justify="space" flexWrap="wrap">
        <HStack>
          <Text fontSize="xs" fontWeight="bold">
            ZoneMaster:
          </Text>
          <Text fontSize="xs">{zoneMaster.ip || "Not configured"}</Text>
        </HStack>

        <HStack>
          <Text fontSize="xs" fontWeight="bold">
            A :
          </Text>
          <Text fontSize="xs">{aRecord.ip || "Not configured"}</Text>
        </HStack>

        <HStack>
          <Text fontSize="xs" fontWeight="bold">
            MX :
          </Text>
          <Text fontSize="xs">{mxRecord.ip || "Not configured"}</Text>
        </HStack>
      </HStack>
    </Box>
  );
};
export default SubscriptionSearchApp;
