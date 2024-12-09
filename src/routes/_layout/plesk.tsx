import React, { useState, useMemo } from "react";
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
import useAuth from "../../hooks/useAuth";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FindPleskSubscriptionByDomainResponse } from "../client";

export const Route = createFileRoute("/_layout/")({
  component: App,
});
import { findPleskSubscriptionByDomainOptions } from "../../client/@tanstack/react-query.gen";

const data = [
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

  const handleToggle = (index) => {
    setExpanded((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some(
        (value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.domains.some((domain) =>
            domain.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    );
  }, [searchTerm]);

  const queryClient = useQueryClient();
  const { data: subscriptionsList, isLoading } =
    useQuery<FindPleskSubscriptionByDomainResponse>({
      ...findPleskSubscriptionByDomainOptions(),
    });
  return (
    <ChakraProvider>
      <VStack spacing={4} width="100%" margin="50px auto" maxWidth="1200px">
        <Input
          placeholder="Search subscriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="100%"
        />
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
              {filteredData.map((item, index) => (
                <React.Fragment key={index}>
                  <Tr>
                    <Td>{item.host}</Td>
                    <Td>{item.id}</Td>
                    <Td>{item.name}</Td>
                    <Td>{item.username}</Td>
                    <Td>{item.userlogin}</Td>
                    <Td>
                      {item.domains.slice(0, 2).map((domain, idx) => (
                        <Text key={idx}>{domain}</Text>
                      ))}
                      {item.domains.length > 2 && <Text>...</Text>}
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
