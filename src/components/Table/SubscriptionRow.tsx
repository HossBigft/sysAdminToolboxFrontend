import React, { useState } from "react";
import { Tr, Td, Collapse, Box, Button, Icon } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import DomainDetails from "./DomainDetails";
import { TooltipHostIcon } from "../Helpers/TooltipHelpers";

const SubscriptionRow = ({ item, handleLoginLinkClick }) => {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);

  return (
    <>
      <Tr>
        <Td>
          {item.host}
          <TooltipHostIcon item={item} />
        </Td>
        <Td>{item.id}</Td>
        <Td>{item.name}</Td>
        <Td>{item.username}</Td>
        <Td>{item.userlogin}</Td>
        <Td>{item.domains.slice(0, 3).join(", ")}...</Td>
        <Td>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => handleLoginLinkClick(item)}
          >
            Get Login Link
          </Button>
        </Td>
        <Td onClick={handleToggle} style={{ cursor: "pointer", textAlign: "center" }}>
          <Icon as={ChevronDownIcon} transform={expanded ? "rotate(180deg)" : "rotate(0deg)"} />
        </Td>
      </Tr>
      <Tr>
        <Td colSpan="7" p={0}>
          <Collapse in={expanded}>
            <Box p={4} bg="gray.50">
              <DomainDetails domains={item.domains} />
            </Box>
          </Collapse>
        </Td>
      </Tr>
    </>
  );
};

export default SubscriptionRow;
