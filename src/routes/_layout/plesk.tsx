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
import { findPleskSubscriptionByDomainOptions } from "../../client/@tanstack/react-query.gen";
import useAuth from "../../hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/_layout/")({
  component: App,
});

const data = [
  // Mock data, you might fetch from your API instead
  {
    host: "TEST_HOSTS[0]",
    id: "1184",
    name: "gruzo.kz",
    username: "FIO",
    userlogin: "p-2342343",
    domains: [
      "gruzo.kz",
      "sdfsd.gruzo.kz",
      "pomogite.gruzo.kz",
      "nodejs.gruzo.kz",
      "virtualizor.gruzo.kz",
      "wp.gruzo.kz",
      "onebula.gruzo.kz",
      "mxtest.gruzo.kz",
      "zone.gruzo.kz",
      "zless.gruzo.kz",
    ],
  },
  {
    host: "TEST_HOSTS[1]",
    id: "1185",
    name: "example.com",
    username: "JohnDoe",
    userlogin: "j-567890",
    domains: ["example.com", "blog.example.com", "shop.example.com"],
  },
];

function App() {
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false); // State to trigger the query when Enter is pressed

  const {
    data: subscriptionData,
    error,
    isLoading,
  } = useQuery({
    ...findPleskSubscriptionByDomainOptions({ query: { domain: searchTerm } }), // queryFn as part of the object
    enabled: triggerSearch && !!searchTerm, // Run only when triggerSearch is true and searchTerm is not empt
  });
  
  useEffect(() => {
    if (subscriptionData) {
      setTriggerSearch(false); // Reset triggerSearch after successful data fetch
    }
  }, [subscriptionData]);


  useEffect(() => {
    console.log("triggerSearch has changed:", triggerSearch);
  }, [triggerSearch]);

  const filteredData = subscriptionData;

  const handleToggle = (index) => {
    setExpanded((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  // Handle the Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setTriggerSearch(true); // Trigger search when Enter is pressed
    }
  };
  return (
    <ChakraProvider>
      <VStack spacing={4} width="100%" margin="50px auto" maxWidth="1200px">
        <Input
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
          onKeyPress={handleKeyPress} // Trigger search when Enter is pressed
          width="100%"
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
              {filteredData?.map((item, index) => (
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
                        <Box p={4} bg="gray.50">
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

export default App;
