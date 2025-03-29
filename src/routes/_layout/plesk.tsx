import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "../../components/SubscriptionSearch/SearchInput";
import HostCell from "../../components/SubscriptionSearch/HostCell";
import DomainsList from "../../components/SubscriptionSearch/DomainsList";
import { useSubscriptionSearch } from "../../hooks/plesk/useSubscriptionSearch";
import { useDnsRecords } from "../../hooks/dns/useDnsRecords";
import useSubscriptionLoginLink from "../../hooks/plesk/useSubscriptionLoginLink";
import useCreateTestMail from "../../hooks/plesk/useCreateTestMail";
import useSetZoneMaster from "../../hooks/plesk/useSetZoneMaster";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export const Route = createFileRoute("/_layout/")({
  component: SubscriptionSearchApp,
});

// Status color and display mapping
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

function SubscriptionSearchApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clickedItem, setClickedItem] = useState(null);
  const [finalSearchTerm, setFinalSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { subscriptionQuery, fetchSubscription } =
    useSubscriptionSearch(finalSearchTerm);

  const { aRecord, mxRecord, zoneMaster, refetchDnsRecords } =
    useDnsRecords(finalSearchTerm);

  const { fetch: refetchLoginLink } = useSubscriptionLoginLink(clickedItem);
  const { mutateZoneMaster } = useSetZoneMaster();
  const { fetch: refetchTestMailCredentials } = useCreateTestMail(
    clickedItem,
    finalSearchTerm
  );

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setFinalSearchTerm(searchTerm.trim());
      fetchSubscription();
      refetchDnsRecords();
    }
  };

  const handleLoginLinkClick = (item) => {
    setClickedItem(item);
    queryClient.invalidateQueries({ queryKey: ["subscriptionLoginLink"] });
    refetchLoginLink();
  };

  const handleSetZoneMasterClick = (item, searchTerm) => {
    setClickedItem(item);
    mutateZoneMaster({
      body: { target_plesk_server: item.host, domain: searchTerm },
    });
  };
  const handleTestMailClick = (item) => {
    setClickedItem(item);
    refetchTestMailCredentials();
  };

  return (
    <ChakraProvider>
      <VStack
        spacing={4}
        width="100%"
        margin="50px auto"
        maxWidth={["100%", "90%", "80%", "1600px"]}
        px={[2, 4, 6, 0]}
      >
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          isDisabled={subscriptionQuery.isLoading}
        />

        {subscriptionQuery.isLoading && <Text>Loading...</Text>}
        {subscriptionQuery.error && (
          <Text color="red.500">Error: {subscriptionQuery.error.message}</Text>
        )}

        <Box overflowX="auto" width="100%" maxWidth="100%">
          <Table
            variant="simple"
            size="sm"
            width="100%"
            style={{ tableLayout: "fixed" }}
          >
            <Thead>
              <Tr>
                <Th width={["15%"]}>Host</Th>
                <Th width={["10%", "7%", "5%"]}>Name</Th>
                <Th width={["10%", "7%", "5%"]}>Status</Th>
                <Th width={["10%", "7%", "5%"]}>ID</Th>
                <Th width={"10%"}>Domains</Th>
                <Th width={["10%", "8%", "8%"]}>Subscription Size</Th>
                <Th width={["10%", "12%", "10%"]}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subscriptionQuery.data?.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <HostCell
                      host={item.host}
                      zoneMaster={zoneMaster}
                      aRecord={aRecord}
                      mxRecord={mxRecord}
                    />
                  </Td>
                  <Td>{item.name}</Td>
                  <Td>
                    <Tooltip
                      label={`Subscription Status: ${STATUS_DISPLAY_MAPPING[item.subscription_status]}`}
                    >
                      <Badge
                        colorScheme={
                          STATUS_COLOR_MAPPING[item.subscription_status] ||
                          "gray"
                        }
                        variant="solid"
                      >
                        {STATUS_DISPLAY_MAPPING[item.subscription_status] ||
                          item.subscription_status}
                      </Badge>
                    </Tooltip>
                  </Td>
                  <Td>{item.id}</Td>
                  <Td>
                    <Tooltip
                      label={
                        <VStack
                          align="start"
                          maxHeight="300px"
                          overflowY="auto"
                        >
                          {item.domain_states.map((domainState) => (
                            <Text key={domainState.domain} fontSize="xs">
                              {domainState.domain}: {domainState.status}
                            </Text>
                          ))}
                        </VStack>
                      }
                      aria-label="Domain States"
                    >
                      <DomainsList domains={item.domains} />
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={`${item.subscription_size_mb} MB`}>
                      <HStack spacing={2}>
                        <Text>
                          {(item.subscription_size_mb / 1024).toFixed(2)} GB
                        </Text>
                        {item.is_space_overused && (
                          <FaExclamationTriangle color="red" size="1.2em" />
                        )}
                      </HStack>
                    </Tooltip>
                  </Td>
                  <Td>
                    <VStack spacing={2}>
                      {currentUser?.ssh_username !== null && (
                        <Button
                          colorScheme="blue"
                          size="xs"
                          onClick={() => handleLoginLinkClick(item)}
                        >
                          Get Login Link
                        </Button>
                      )}
                      <Button
                        colorScheme="blue"
                        size="xs"
                        onClick={() => handleTestMailClick(item)}
                      >
                        Get test mailbox
                      </Button>
                      <Button
                        colorScheme="blue"
                        size="xs"
                        onClick={() =>
                          handleSetZoneMasterClick(item, searchTerm)
                        }
                      >
                        Set as zoneMaster
                      </Button>
                    </VStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}

export default SubscriptionSearchApp;
