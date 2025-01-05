import React from "react";
import { Text } from "@chakra-ui/react";

const DomainDetails = ({ domains }) => {
  return (
    <div>
      <Text fontWeight="bold">All Domains:</Text>
      <ul>
        {domains.map((domain, idx) => (
          <li key={idx}>{domain}</li>
        ))}
      </ul>
    </div>
  );
};

export default DomainDetails;
