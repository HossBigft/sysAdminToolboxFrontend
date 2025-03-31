import { Tooltip, Box, Icon } from "@chakra-ui/react";
import { EmailIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { FaStar } from "react-icons/fa";

const HostCell = ({ host, hostIp, zoneMaster, aRecord, mxRecord }) => {
  return (
    <Box display="flex" alignItems="center" gap="2">
      {host}{" "}
      {hostIp === zoneMaster.ip[0] && (
        <Tooltip
          hasArrow
          label={`DNS zone master [${zoneMaster.ip}]`}
          bg="gray.300"
          color="black"
        >
          <span>
            <Icon as={FaStar} />
          </span>
        </Tooltip>
      )}
      {hostIp === aRecord.ip && (
        <Tooltip
          hasArrow
          label="A record of domain points to this host"
          bg="gray.300"
          color="black"
        >
          <CheckCircleIcon />
        </Tooltip>
      )}
      {hostIp === mxRecord.ip && (
        <Tooltip
          hasArrow
          label="MX record points to this host"
          bg="gray.300"
          color="black"
        >
          <EmailIcon />
        </Tooltip>
      )}
    </Box>
  );
};

export default HostCell;
