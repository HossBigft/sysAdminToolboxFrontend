import { Tooltip, Box, HStack, Tag, Icon, VStack } from "@chakra-ui/react";
import { EmailIcon } from "@chakra-ui/icons";
import { FaStar, FaGlobe } from "react-icons/fa";

const HostCell = ({ host, hostIp, zoneMaster, aRecord, mxRecord }) => {
  // Determine which roles this host serves
  const isDnsZoneMaster = hostIp === zoneMaster.ip[0];
  const isDomainHost = hostIp === aRecord.ip;
  const isMailServer = hostIp === mxRecord.ip;

  // Color scheme for better visual categorization
  const tagColors = {
    dns: "yellow",
    domain: "green",
    mail: "blue",
  };

  return (
    <VStack spacing={2} align="left">
      <Box fontWeight="medium">{host}</Box>

      <HStack spacing={2} justify="left">
        {/* Role indicators with consistent styling */}

        {isDomainHost && (
          <Tooltip
            hasArrow
            label="Domain A record points to this host"
            placement="bottom"
          >
            <Tag size="sm" colorScheme={tagColors.domain} variant="subtle">
              <Icon as={FaGlobe} mr={1} /> Domain
            </Tag>
          </Tooltip>
        )}

        {isMailServer && (
          <Tooltip
            hasArrow
            label="MX record points to this host"
            placement="bottom"
          >
            <Tag size="sm" colorScheme={tagColors.mail} variant="subtle">
              <EmailIcon mr={1} /> Mail
            </Tag>
          </Tooltip>
        )}

        {isDnsZoneMaster && (
          <Tooltip
            hasArrow
            label={`DNS Zone Master [${zoneMaster.ip}]`}
            placement="bottom"
          >
            <Tag size="sm" colorScheme={tagColors.dns} variant="subtle">
              <Icon as={FaStar} mr={1} /> DNS
            </Tag>
          </Tooltip>
        )}
      </HStack>
    </VStack>
  );
};

export default HostCell;
