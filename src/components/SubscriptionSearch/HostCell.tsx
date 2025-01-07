import { Tooltip, Box, Icon } from '@chakra-ui/react';
import { EmailIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FiStar } from 'react-icons/fi';

const HostCell = ({ host, zoneMaster, aRecord, mxRecord }) => (
  <Box display="flex" alignItems="center" gap="2">
    {host}{' '}
    {host === zoneMaster.ptr && (
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
    {host === aRecord.ptr && (
      <Tooltip
        hasArrow
        label="A record of domain points to this host"
        bg="gray.300"
        color="black"
      >
        <CheckCircleIcon />
      </Tooltip>
    )}
    {host === mxRecord.ptr && (
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

export default HostCell;