import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  TableContainer,
} from "@chakra-ui/react";
import useAuth from "../../hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

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
  // Add more objects as needed
];

function Dashboard() {
  const [expanded, setExpanded] = useState({});

  const handleToggle = (index) => {
    setExpanded((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  return (
      <TableContainer>
        <Accordion allowMultiple>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Host</Th>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Username</Th>
                  <Th>User Login</Th>
                  <Th>Domains</Th>
                </Tr>
              </Thead>
            </Table>
          {data.map((item, index) => (
            <AccordionItem key={index}>
              <AccordionButton>
                  <Table variant="simple">
                    <Tbody>
                      <Tr>
                        <Td>{item.host}</Td>
                        <Td>{item.id}</Td>
                        <Td>{item.name}</Td>
                        <Td>{item.username}</Td>
                        <Td>{item.userlogin}</Td>
                        <Td>{item.domains.slice(0, 2).join(", ")}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Box>
                  <ul>
                    {item.domains.map((domain, idx) => (
                      <li key={idx}>{domain}</li>
                    ))}
                  </ul>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </TableContainer>
  );
}
