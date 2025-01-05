import React from "react";
import { Table, Thead, Tbody, Tr, Th } from "@chakra-ui/react";
import SubscriptionRow from "./SubscriptionRow";

const SubscriptionTable = ({ data, handleLoginLinkClick }) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Host</Th>
          <Th>ID</Th>
          <Th>Name</Th>
          <Th>Username</Th>
          <Th>User Login</Th>
          <Th>Domains</Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item, index) => (
          <SubscriptionRow
            key={index}
            item={item}
            handleLoginLinkClick={handleLoginLinkClick}
          />
        ))}
      </Tbody>
    </Table>
  );
};

export default SubscriptionTable;
