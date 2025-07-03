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
  Box,
  Divider,
  Icon,
  SimpleGrid,
  useToast,
} from "@chakra-ui/react";
import {
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useState, useEffect, Fragment } from "react";
import HostCell from "./HostCell";
import DomainsList from "./DomainsList";
import useSubscriptionLoginLink from "../../hooks/plesk/useSubscriptionLoginLink";
import useCreateTestMail from "../../hooks/plesk/useCreateTestMail";
import useSetZoneMaster from "../../hooks/plesk/useSetZoneMaster";
import { useQueryClient } from "@tanstack/react-query";
import { useZoneMaster } from "../../hooks/dns/useZoneMaster";

// Status color and display mapping
const STATUS_COLOR_MAPPING = {
  online: "green",
  subscription_is_disabled: "red",
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
}) => {
  const queryClient = useQueryClient();
  const [clickedItem, setClickedItem] = useState(null);
  const { fetch: fetchLoginLink } = useSubscriptionLoginLink(clickedItem);

  const { mutateZoneMaster, isSuccess, isError, error } = useSetZoneMaster();
  const { fetch: fetchTestMailCredentials } = useCreateTestMail(
    clickedItem,
    searchTerm
  );

  const { refetch: refetchZoneMaster } = useZoneMaster(searchTerm);

  const toast = useToast();
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success",
        description: `Zonemaster successfully set to ${clickedItem?.host}`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      refetchZoneMaster();
    }
  }, [isSuccess, clickedItem, toast]);

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error",
        description: `Failed to set zonemaster: ${error.message || "Unknown error"}`,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [isError, error, toast]);

  // State to track which rows are expanded
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpansion = (itemId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleLoginLinkClick = (item) => {
    setClickedItem(item);
    queryClient.invalidateQueries({ queryKey: ["subscriptionLoginLink"] });
    fetchLoginLink();
  };

  const handleSetZoneMasterClick = (item) => {
    setClickedItem(item);
    mutateZoneMaster({
      body: { target_plesk_server: item.host.name, domain: searchTerm },
    });
  };

  const handleTestMailClick = (item) => {
    setClickedItem(item);
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
          <Th width="3%"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {subscriptionData.map((item) => (
          <Fragment key={item.id}>
            <SubscriptionRow
              key={item.id}
              item={item}
              dnsData={dnsData}
              hostIp={hostRecords[item.host.ips]}
              currentUser={currentUser}
              onLoginLink={() => handleLoginLinkClick(item)}
              onTestMail={() => handleTestMailClick(item)}
              onSetZoneMaster={() => handleSetZoneMasterClick(item)}
              isExpanded={!!expandedRows[item.id]}
              onToggleExpand={() => toggleRowExpansion(item.id)}
            />
            {expandedRows[item.id] && (
              <Tr key={`expanded-${item.id}`}>
                <Td colSpan={9} padding={0}>
                  <ExpandedDetails item={item} />
                </Td>
              </Tr>
            )}
          </Fragment>
        ))}
      </Tbody>
    </Table>
  );
};

// Extracted row component for better organization
const SubscriptionRow = ({
  item,
  dnsData,
  currentUser,
  onLoginLink,
  onTestMail,
  onSetZoneMaster,
  isExpanded,
  onToggleExpand,
}) => {

  const { internalARecord, internalMxRecord, zonemaster } = dnsData;
  return (
    <Tr key={item.id}>
      <Td>
        <HostCell
          host={item.host}
          zonemaster={zonemaster}
          aRecord={internalARecord}
          mxRecord={internalMxRecord}
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
        Subscription Details
      </Text>
      <Divider mb={3} />

      <VStack align="start" spacing={2} mb={4}>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            Subscription Name:
          </Text>
          <Text>{item.name || "N/A"}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            User Login:
          </Text>
          <Text>{item.userlogin || "N/A"}</Text>
        </HStack>
        <HStack>
          <Text fontWeight="semibold" width="200px">
            User Name:
          </Text>
          <Text>{item.username || "N/A"}</Text>
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
