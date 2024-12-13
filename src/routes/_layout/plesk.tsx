import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  Input,
  VStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import {
  findPleskSubscriptionByDomainOptions,
  getARecordOptions,
  getPtrRecordOptions,
  getMxRecordOptions,
} from "../../client/@tanstack/react-query.gen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
  component: App,
});

function App() {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false); // State to trigger the query when Enter is pressed
  const [lastValidData, setLastValidData] = useState([]); // Keep track of last valid data

  // Query for fetching data based on search term
  const {
    data: subscriptionData,
    error,
    isLoading,
    isFetching,
  } = useQuery({
    ...findPleskSubscriptionByDomainOptions({ query: { domain: searchTerm } }),
    queryKey: ["subscriptionSearch", searchTerm], // Add searchTerm to the query key
    enabled: triggerSearch && !!searchTerm, // Only trigger search when needed
    retry: 0,
    refetchOnWindowFocus: false,
  });

  const { data: aRecordRequest } = useQuery({
    ...getARecordOptions({ query: { domain: searchTerm } }),
    enabled: triggerSearch && !!searchTerm,
    retry: 0,
    refetchOnWindowFocus: false,
  });
  console.log(aRecordRequest);

  const aRecord=aRecordRequest?.records[0]

  const { data: aRecordPtr } = useQuery({
    ...getPtrRecordOptions({ query: { ip: aRecord } }),
    enabled: !!aRecord && aRecordRequest.records.length == 1,
    refetchOnWindowFocus: false,
  });


  console.log(aRecordPtr);

  const { data: mxRecordRequest } = useQuery({
    ...getMxRecordOptions({ query: { domain: searchTerm } }),
    enabled: triggerSearch && !!searchTerm,
    refetchOnWindowFocus: false,
  });
  console.log(mxRecordRequest);

  const mxRecord = mxRecordRequest?.records[0]
  const { data: aRecordOfMxRecordRequest } = useQuery({
    ...getARecordOptions({ query: { domain: mxRecord } }),
    enabled: !!mxRecord && mxRecordRequest.records.length == 1,
    refetchOnWindowFocus: false,
  });
  console.log(aRecordOfMxRecordRequest);

  const aOfMxRecord = aRecordOfMxRecordRequest?.records[0]

  const { data: mxRecordPtr } = useQuery({
    ...getPtrRecordOptions({ query: { ip: aOfMxRecord } }),
    enabled: !!aOfMxRecord  && aRecordOfMxRecordRequest.records.length == 1,
    refetchOnWindowFocus: false,
  });

  console.log(mxRecordPtr);

  useEffect(() => {
    if (subscriptionData || error) {
      setTriggerSearch(false); // Reset triggerSearch when data or error is received
    }
  }, [subscriptionData, error]);

  useEffect(() => {
    if (subscriptionData?.length) {
      setLastValidData(subscriptionData); // Store valid data after successful fetch
    }
  }, [subscriptionData]);

  const handleToggle = (index) => {
    setExpanded((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      // Reset the results when Enter is pressed
      setLastValidData([]); // Clear previous results immediately
      setTriggerSearch(true); // Trigger a new search
    }
  };

  const tableData =
    isFetching || subscriptionData?.length === 0
      ? []
      : subscriptionData || lastValidData;

  return (
    <ChakraProvider>
      <VStack spacing={4} width="100%" margin="50px auto" maxWidth="1200px">
        <Input
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          width="100%"
          isDisabled={isLoading} // Disable input during loading
        />
        {isLoading && <Text>Loading...</Text>}
        {error && <Text>Error: {error.message}</Text>}
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
                <Th width="50px"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {tableData?.map((item, index) => (
                <React.Fragment key={index}>
                  <Tr>
                    <Td>{item.host}</Td>
                    <Td>{item.id}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.username}</Td>
                    <Td>{item.userlogin}</Td>
                    <Td>
                      {item.domains.slice(0, 3).map((domain, idx) => (
                        <Text key={idx}>{domain}</Text>
                      ))}
                      {item.domains.length > 3 && <Text>...</Text>}
                    </Td>
                    <Td
                      onClick={() => handleToggle(index)}
                      style={{ cursor: "pointer", textAlign: "center" }}
                    >
                      <Icon
                        as={ChevronDownIcon}
                        transform={
                          expanded[index] ? "rotate(180deg)" : "rotate(0deg)"
                        }
                        transition="transform 0.2s"
                      />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td colSpan="7" p={0}>
                      <Collapse in={expanded[index]}>
                        <Box p={6} bg="gray.50">
                          <Text fontWeight="bold">All Domains:</Text>
                          <ul>
                            {item.domains.map((domain, idx) => (
                              <li key={idx}>{domain}</li>
                            ))}
                          </ul>
                        </Box>
                      </Collapse>
                    </Td>
                  </Tr>
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
