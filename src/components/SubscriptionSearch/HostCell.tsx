import { useEffect } from "react";
import { Tooltip, Box, Icon } from "@chakra-ui/react";
import { EmailIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { FiStar } from "react-icons/fi";
import { useARecord } from "../../hooks/dns/useARecord";

const HostCell = ({ host, zoneMaster, aRecord, mxRecord }) => {
  const { ip: resolvedIP, fetch } = useARecord(host);
  useEffect(() => {
    fetch();
  }, [fetch]);
  return (
    <Box display="flex" alignItems="center" gap="2">
      {host}{" "}
      {resolvedIP === zoneMaster.ip[0] && (
        <Tooltip
          hasArrow
          label={`DNS zone master [${zoneMaster.ip}]`}
          bg="gray.300"
          color="black"
        >
          <span>
            <Icon as={FiStar} />
          </span>
        </Tooltip>
      )}
      {resolvedIP === aRecord.ip && (
        <Tooltip
          hasArrow
          label="A record of domain points to this host"
          bg="gray.300"
          color="black"
        >
          <CheckCircleIcon />
        </Tooltip>
      )}
      {resolvedIP === mxRecord.ip && (
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
