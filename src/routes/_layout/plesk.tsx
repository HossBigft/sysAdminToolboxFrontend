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
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "../../components/SubscriptionSearch/SearchInput";
import HostCell from "../../components/SubscriptionSearch/HostCell";
import DomainsList from "../../components/SubscriptionSearch/DomainsList";
import { useSubscriptionSearch } from "../../hooks/plesk/useSubscriptionSearch";
import { useDnsRecords } from "../../hooks/dns/useDnsRecords";
import useSubscriptionLoginLink from "../../hooks/plesk/useSubscriptionLoginLink";

export const Route = createFileRoute("/_layout/")({
  component: SubscriptionSearchApp,
});

function SubscriptionSearchApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);

  const {
    data: subscriptionData,
    error,
    isLoading,
  } = useSubscriptionSearch(searchTerm, triggerSearch);

  const { aRecord, mxRecord, zoneMaster } = useDnsRecords(
    searchTerm,
    triggerSearch
  );

  const { refetch: refetchLoginLink } = useSubscriptionLoginLink(clickedItem);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setTriggerSearch(true);
    }
  };

  useEffect(() => {
    if (subscriptionData || error) {
      setTriggerSearch(false); // Reset triggerSearch when data or error is received
    }
  }, [subscriptionData, error]);

  const handleLoginLinkClick = (item) => {
    queryClient.removeQueries(["subscriptionLoginLink"]);
    setClickedItem(item);
    refetchLoginLink();
  };

  return (
    <ChakraProvider>
      <VStack spacing={4} width="100%" margin="50px auto" maxWidth="1200px">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleSearch}
          isDisabled={isLoading}
        />

        {isLoading && <Text>Loading...</Text>}
        {error && <Text color="red.500">Error: {error.message}</Text>}

        <Box overflowX="auto" width="100%">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Host</Th>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Username</Th>
                <Th>User Login</Th>
                <Th>Domains</Th>
                {currentUser.ssh_username !== "" && (
                  <Th width="100px">Actions</Th>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {subscriptionData?.map((item) => (
                <Tr key={item.id}>
                  <Td>
                    <HostCell
                      host={item.host}
                      zoneMaster={zoneMaster}
                      aRecord={aRecord}
                      mxRecord={mxRecord}
                    />
                  </Td>
                  <Td>{item.id}</Td>
                  <Td>{item.name}</Td>
                  <Td>{item.username}</Td>
                  <Td>{item.userlogin}</Td>
                  <Td>
                    <DomainsList domains={item.domains} />
                  </Td>
                  <Td>
                    {currentUser.ssh_username !== "" && (
                      <Button
                        colorScheme="blue"
                        size="sm"
                        onClick={() => handleLoginLinkClick(item)}
                      >
                        Get Login Link
                      </Button>
                    )}
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
