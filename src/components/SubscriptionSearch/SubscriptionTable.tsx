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
  Collapse,
  Box,
  Divider,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useState } from "react";
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

  // State to track which rows are expanded
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (itemId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

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
          <Th width="3%"></Th> {/* Column for expand/collapse button */}
        </Tr>
      </Thead>
      <Tbody>
        {subscriptionData.map((item) => (
          <>
            <SubscriptionRow
              key={item.id}
              item={item}
              dnsData={dnsData}
              hostIp={hostRecords[item.host]}
              currentUser={currentUser}
              onLoginLink={() => handleLoginLinkClick(item)}
              onTestMail={() => handleTestMailClick(item)}
              onSetZoneMaster={() => handleSetZoneMasterClick(item)}
              isExpanded={!!expandedRows[item.id]}
              onToggleExpand={() => toggleRowExpansion(item.id)}
            />
            {expandedRows[item.id] && (
              <Tr>
                <Td colSpan={9} padding={0}>
                  <ExpandedDetails item={item} />
                </Td>
              </Tr>
            )}
          </>
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
  isExpanded,
  onToggleExpand,
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
      <Td>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleExpand}
          aria-label={isExpanded ? "Collapse row" : "Expand row"}
        >
          <Icon as={isExpanded ? FaChevronUp : FaChevronDown} />
        </Button>
      </Td>
    </Tr>
  );
};

// New component for the expanded details
const ExpandedDetails = ({ item }) => {
  return (
    <Box bg="gray.50" p={4} w="100%">
      <Text fontWeight="bold" mb={2}>
        Domain Details
      </Text>
      <Divider mb={3} />

      <VStack align="start" spacing={2} mb={4}>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            User Login:
          </Text>
          <Text>{item.userlogin || "N/A"}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            Subscription Size:
          </Text>
          <Text>
            {item.subscription_size_mb} MB (
            {(item.subscription_size_mb / 1024).toFixed(2)} GB)
          </Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            Space Overused:
          </Text>
          <Text>{item.is_space_overused ? "Yes" : "No"}</Text>
        </HStack>
      </VStack>

      <Text fontWeight="bold" mt={4} mb={2}>
        Domains Status
      </Text>
      <Divider mb={3} />

      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {item.domain_states &&
          item.domain_states.map((domainState, index) => (
            <Box
              key={index}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              shadow="sm"
            >
              <Text fontWeight="medium" mb={2}>
                {domainState.domain}
              </Text>
              <Badge
                colorScheme={STATUS_COLOR_MAPPING[domainState.status] || "gray"}
                variant="solid"
              >
                {STATUS_DISPLAY_MAPPING[domainState.status] ||
                  domainState.status}
              </Badge>
            </Box>
          ))}
      </SimpleGrid>
    </Box>
  );
};

export default SubscriptionTable;
