import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Text,
  Button,
  HStack,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import { FaExclamationTriangle } from "react-icons/fa";
import HostCell from "./HostCell";
import DomainsList from "./DomainsList";
import useSubscriptionLoginLink from "../../hooks/plesk/useSubscriptionLoginLink";
import useCreateTestMail from "../../hooks/plesk/useCreateTestMail";
import useSetZoneMaster from "../../hooks/plesk/useSetZoneMaster";
import { useQueryClient } from "@tanstack/react-query";

// Status color and display mapping
const STATUS_COLOR_MAPPING = {
  online: "green",
  subscription_is_disabled: "yellow",
  domain_disabled_by_admin: "red",
  domain_disabled_by_client: "orange",
};

const STATUS_DISPLAY_MAPPING = {
  online: "Online",
  subscription_is_disabled: "Subscription Disabled",
  domain_disabled_by_admin: "Disabled by Admin",
  domain_disabled_by_client: "Disabled by Client",
};

const SubscriptionTable = ({
  subscriptionData,
  dnsData,
  hostRecords,
  searchTerm,
  currentUser,
  onItemAction,
}) => {
  const queryClient = useQueryClient();
  const { fetch: fetchLoginLink } = useSubscriptionLoginLink(null);
  const { mutateZoneMaster } = useSetZoneMaster();
  const { fetch: fetchTestMailCredentials } = useCreateTestMail(
    null,
    searchTerm
  );

  const handleLoginLinkClick = (item) => {
    onItemAction(item);
    queryClient.invalidateQueries({ queryKey: ["subscriptionLoginLink"] });
    fetchLoginLink();
  };

  const handleSetZoneMasterClick = (item) => {
    onItemAction(item);
    mutateZoneMaster({
      body: { target_plesk_server: item.host, domain: searchTerm },
    });
  };

  const handleTestMailClick = (item) => {
    onItemAction(item);
    fetchTestMailCredentials();
  };

  return (
    <Table
      variant="simple"
      size="sm"
      width="100%"
      minWidth="800px"
      style={{ tableLayout: "auto" }}
    >
      <Thead>
        <Tr>
          <Th width="15%">Host</Th>
          <Th width={["10%", "7%", "5%"]}>Name</Th>
          <Th width={["10%", "7%", "5%"]}>Status</Th>
          <Th width="5%">ID</Th>
          <Th width="5%">Username</Th>
          <Th width="5%">Domains</Th>
          <Th width="8%">Size</Th>
          <Th width={["15%", "18%", "15%"]} textAlign="center">
            Actions
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {subscriptionData.map((item) => (
          <SubscriptionRow
            key={item.id}
            item={item}
            dnsData={dnsData}
            hostIp={hostRecords[item.host]}
            currentUser={currentUser}
            onLoginLink={() => handleLoginLinkClick(item)}
            onTestMail={() => handleTestMailClick(item)}
            onSetZoneMaster={() => handleSetZoneMasterClick(item)}
          />
        ))}
      </Tbody>
    </Table>
  );
};

// Extracted row component for better organization
const SubscriptionRow = ({
  item,
  dnsData,
  hostIp,
  currentUser,
  onLoginLink,
  onTestMail,
  onSetZoneMaster,
}) => {
  const { aRecord, mxRecord, zoneMaster } = dnsData;

  return (
    <Tr>
      <Td>
        <HostCell
          host={item.host}
          hostIp={hostIp}
          zoneMaster={zoneMaster}
          aRecord={aRecord}
          mxRecord={mxRecord}
        />
      </Td>
      <Td>{item.name}</Td>
      <Td>
        <Tooltip
          label={`Subscription Status: ${STATUS_DISPLAY_MAPPING[item.subscription_status]}`}
        >
          <Badge
            colorScheme={
              STATUS_COLOR_MAPPING[item.subscription_status] || "gray"
            }
            variant="solid"
          >
            {STATUS_DISPLAY_MAPPING[item.subscription_status] ||
              item.subscription_status}
          </Badge>
        </Tooltip>
      </Td>
      <Td>{item.id}</Td>
      <Td>{item.username}</Td>
      <Td>
        <DomainsList domains={item.domains} />
      </Td>
      <Td>
        <Tooltip label={`${item.subscription_size_mb} MB`}>
          <HStack spacing={2}>
            <Text>{(item.subscription_size_mb / 1024).toFixed(2)} GB</Text>
            {item.is_space_overused && (
              <FaExclamationTriangle color="red" size="1.2em" />
            )}
          </HStack>
        </Tooltip>
      </Td>
      <Td>
        <VStack spacing={2}>
          {currentUser?.ssh_username !== null && (
            <Button colorScheme="blue" size="xs" onClick={onLoginLink}>
              Get Login Link
            </Button>
          )}
          <Button colorScheme="blue" size="xs" onClick={onTestMail}>
            Get test mailbox
          </Button>
          <Button colorScheme="blue" size="xs" onClick={onSetZoneMaster}>
            Set as zoneMaster
          </Button>
        </VStack>
      </Td>
    </Tr>
  );
};

export default SubscriptionTable;
