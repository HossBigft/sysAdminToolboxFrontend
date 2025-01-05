import React from "react";
import { Tooltip } from "@chakra-ui/react";
import { FiStar } from "react-icons/fi";

export const TooltipHostIcon = ({ item }) => {
  if (item.isZoneMaster) {
    return (
      <Tooltip hasArrow label="DNS Zone Master" bg="gray.300" color="black">
        <FiStar />
      </Tooltip>
    );
  }
  return null;
};
