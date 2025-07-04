import {
    Box,
    Text,
    HStack,
    Icon,
    useColorModeValue,
    Tooltip,
    useClipboard,
    Flex, VStack
} from "@chakra-ui/react";
import {FaServer, FaGlobe, FaEnvelope, FaCopy, FaExclamationTriangle, FaNotEqual, FaCheck} from "react-icons/fa";
import {useState, useEffect, useMemo} from "react";

const DnsInfoBar = ({
                        internalARecord,
                        internalMxRecord,
                        googleARecord,
                        googleMxRecord,
                        zonemasters,
                        authoritativeNsRecords,
                        publicNsRecords
                    }) => {
    const [copyValue, setCopyValue] = useState("");
    const [lastCopied, setLastCopied] = useState("");
    // Reset "Copied!" state after a delay
    useEffect(() => {
        if (lastCopied) {
            const timer = setTimeout(() => {
                setLastCopied("");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [lastCopied]);

    const internalDnsServers = ["ns1.hoster.kz.", "ns2.hoster.kz.", "ns3.hoster.kz.", "ns4.hoster.kz."]


    type NSRecordObject = {
        name: string;
        records?: string[];
    };

    type ResponseShape = {
        records?: NSRecordObject[]; // what you’ll pass
    };


    // Color values that will change depending on the color mode
    const bgColor = useColorModeValue("gray.50", "gray.700");
    const textColor = useColorModeValue("gray.700", "gray.200");
    const iconColorA = useColorModeValue("green.500", "green.300");
    const iconColorB = useColorModeValue("blue.500", "blue.300");
    const iconColorC = useColorModeValue("yellow.500", "yellow.300");
    const copyIconColor = useColorModeValue("gray.400", "gray.500");
    const copyHoverBg = useColorModeValue("gray.100", "gray.600");

    const getTooltipContent = (dnsRecord) => {
        if (!dnsRecord) return "";

        const {ptr, mx, ip} = dnsRecord;
        const parts = [];

        // If ptr exists, start by adding it
        if (ptr) {
            if (mx && ip) {
                parts.push(`${ptr} [${mx} ${ip}]`);
            } else if (ip) {
                parts.push(`${ptr} [${ip}]`);
            } else {
                parts.push(ptr);
            }
        }
        // If only mx and ip exist, handle them separately
        else if (mx && ip) {
            parts.push(`${mx} [${ip}]`);
        } else if (mx) {
            parts.push(`${mx} []`);
        } else if (ip) {
            parts.push(ip);
        }

        return parts.join(" ").trim();
    };

    const normalize = (val) => {
        if (!val) return "";

        if (typeof val === 'object' && !Array.isArray(val)) {
            const actualValue = val.ip || val.ptr || val.value || val.target || "";
            return String(actualValue).trim().toLowerCase();
        }

        if (Array.isArray(val)) {
            return val
                .map(v => {
                    if (typeof v === 'object') {
                        return String(v.ip || v.ptr || v.value || v.target || "").trim().toLowerCase();
                    }
                    return String(v).trim().toLowerCase();
                })
                .filter(v => v !== "")
                .sort()
                .join(",");
        }

        return String(val).trim().toLowerCase();
    };

    const RecordValue = ({value, isEmpty = false, isHighlighted = false}) => {
        const getDisplayValue = (val) => {
            if (!val) return "Empty";

            if (typeof val === 'object' && !Array.isArray(val)) {
                const actualValue = val.ip || val.ptr || val.value || val.target;
                return actualValue || "Empty";
            }

            if (Array.isArray(val)) {
                const displayValues = val
                    .map(v => {
                        if (typeof v === 'object') {
                            return v.ip || v.ptr || v.value || v.target || "";
                        }
                        return String(v);
                    })
                    .filter(v => v !== "");

                return displayValues.length > 0 ? displayValues.join(", ") : "Empty";
            }

            return String(val);
        };

        return (
            <Text
                fontSize="sm"
                color={isEmpty ? "gray.400" : "gray.700"}
                fontWeight={isHighlighted ? "semibold" : "normal"}
                _dark={{
                    color: isEmpty ? "gray.500" : "gray.200"
                }}
            >
                {getDisplayValue(value)}
            </Text>
        );
    };


    const RecordStatus = ({hasMatch, hasValues}) => {
        if (!hasValues) return null;

        return (
            <Icon
                as={hasMatch ? FaCheck : FaExclamationTriangle}
                color={hasMatch ? "green.500" : "orange.500"}
            />
        );
    };

    const normalizeNsRecords = (records) => {
        if (!records) return [];
        if (Array.isArray(records)) {
            return records.map(record => {
                if (typeof record === 'string') return record.toLowerCase().trim().replace(/\.$/, '');
                ;
                return String(record.value || record.target || record).toLowerCase().trim();
            }).filter(Boolean).sort();
        }
        if (typeof records === 'string') return [records.toLowerCase().trim()];
        return [String(records.value || records.target || records).toLowerCase().trim()].filter(Boolean);
    };

    const authNsRecords = normalizeNsRecords(authoritativeNsRecords.records);
    const normalizedPublicNsRecords = normalizeNsRecords(publicNsRecords.records);
    const internalNsRecords = normalizeNsRecords(internalDnsServers)
    let isSubsetArray = (parentArray, subsetArray) => {

        let result = subsetArray.every((el) => {
            return parentArray.includes(el)
        })

        return result
    }

    function isNsRecordsMatch(response: { records: Record<string, string[]> }): boolean {
        const recordGroups = response?.records;
        if (!recordGroups || typeof recordGroups !== 'object') return false;

        const normalize = (arr: string[]): string =>
            arr.map(r => r.toLowerCase().trim().replace(/\.$/, '')).sort().join('|');

        const normalizedSets = Object.values(recordGroups)
            .filter(arr => Array.isArray(arr) && arr.length > 0)
            .map(normalize);

        if (normalizedSets.length === 0) return true;

        const base = normalizedSets[0];
        return normalizedSets.every(set => set === base);
    }

    // Check for NS record issues
    const checkNsIssues = (nsRecordsAuthoritativeNs, publicNsResponse) => {
        const issues = [];

        // Compare authoritative vs internal
        const authMatchesInternal = isSubsetArray(internalNsRecords, nsRecordsAuthoritativeNs);

        if (!authMatchesInternal && authNsRecords.length > 0) {
            issues.push({
                type: 'mismatch',
                message: "NS Mismatch⚠: domain is controlled by third-party nameservers. Authoritative NS records differ from internal NS domains."
            });
        }
        if (publicNsResponse.records && !isNsRecordsMatch(publicNsResponse)) {
            issues.push({
                type: 'inconsistency',
                message: "Public NS Inconsistency ⚠: NS records from public NS and Authoritative NS differ. Authoritative domain servers were changed less than 24 hours ago. Use dnschecker.org to confirm."
            });
        }

        return issues;
    };

    const nsIssues = checkNsIssues(authNsRecords, publicNsRecords);

    const renderNsStatusBadge = () => {
        if (nsIssues.length === 0) return null;

        // Check if there are any mismatch issues that require showing the comparison
        const hasMismatchIssues = nsIssues.some(issue => issue.type === 'mismatch');

        return (
            <Tooltip
                hasArrow
                placement="bottom"
                bg="gray.900"
                color="white"
                maxWidth="lg"
                label={
                    <VStack align="start" spacing={4} p={3}>
                        {/* Display each issue with its relevant details */}
                        {nsIssues.map((issue, index) => (
                            <VStack key={index} align="start" spacing={3} w="100%">
                                {/* Issue Header */}
                                <HStack align="start" spacing={2} w="100%">
                                    <Text fontSize="sm" color="red.300" minW="4">
                                        {index + 1}.
                                    </Text>
                                    <Text fontSize="sm" color="red.300" flex={1}>
                                        {issue.message}
                                    </Text>
                                </HStack>

                                {/* Issue-specific details */}
                                {issue.type === 'mismatch' && (
                                    <Box w="100%" pl={6}>
                                        {/* Side-by-side comparison */}
                                        <HStack spacing={3} align="stretch" w="100%">
                                            {/* Internal NS Servers Section */}
                                            <Box
                                                flex={1}
                                                p={3}
                                                bg="blue.800"
                                                borderRadius="md"
                                                border="2px solid"
                                                borderColor="blue.400"
                                            >
                                                <VStack align="start" spacing={2} h="100%">
                                                    <HStack>
                                                        <Text fontSize="sm" fontWeight="bold" color="blue.200">
                                                            Internal DNS
                                                        </Text>
                                                    </HStack>
                                                    <Box flex={1} w="100%">
                                                        <VStack
                                                            spacing={1}
                                                            bg="blue.700"
                                                            p={2}
                                                            borderRadius="sm"
                                                            minH="60px"
                                                            align="start"
                                                            justify="start"
                                                        >
                                                            {internalNsRecords.length > 0 ? (
                                                                internalNsRecords.map((server, serverIndex) => (
                                                                    <Text
                                                                        key={serverIndex}
                                                                        fontSize="xs"
                                                                        color="white"
                                                                        fontFamily="mono"
                                                                        bg="blue.600"
                                                                        px={2}
                                                                        py={1}
                                                                        borderRadius="sm"
                                                                        w="100%"
                                                                    >
                                                                        {server}
                                                                    </Text>
                                                                ))
                                                            ) : (
                                                                <Text fontSize="xs" color="blue.200" fontStyle="italic">
                                                                    None configured
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                </VStack>
                                            </Box>

                                            {/* VS Divider */}
                                            <VStack justify="center" spacing={1}>
                                                <Icon as={FaNotEqual} color="yellow.300"/>
                                            </VStack>

                                            {/* Authoritative NS Servers Section */}
                                            <Box
                                                flex={1}
                                                p={3}
                                                bg="teal.800"
                                                borderRadius="md"
                                                border="2px solid"
                                                borderColor="teal.400"
                                            >
                                                <VStack align="start" spacing={2} h="100%">
                                                    <HStack>
                                                        <Text fontSize="sm" fontWeight="bold" color="teal.200">
                                                            Authoritative DNS
                                                        </Text>
                                                    </HStack>
                                                    <Box flex={1} w="100%">
                                                        <VStack
                                                            spacing={1}
                                                            bg="teal.700"
                                                            p={2}
                                                            borderRadius="sm"
                                                            minH="60px"
                                                            align="start"
                                                            justify="start"
                                                        >
                                                            {authNsRecords.length > 0 ? (
                                                                authNsRecords.map((server, serverIndex) => {
                                                                    const isInInternal = internalNsRecords.includes(server);
                                                                    return (
                                                                        <HStack
                                                                            key={serverIndex}
                                                                            w="100%"
                                                                            bg={isInInternal ? "teal.600" : "red.600"}
                                                                            px={2}
                                                                            py={1}
                                                                            borderRadius="sm"
                                                                            border={isInInternal ? "none" : "1px solid"}
                                                                            borderColor={isInInternal ? "transparent" : "red.400"}
                                                                        >
                                                                            {!isInInternal && (
                                                                                <Icon as={FaExclamationTriangle}
                                                                                      color="red.200"
                                                                                      size="xs"/>
                                                                            )}
                                                                            <Text
                                                                                fontSize="xs"
                                                                                color="white"
                                                                                fontFamily="mono"
                                                                                flex={1}
                                                                            >
                                                                                {server}
                                                                            </Text>
                                                                            {isInInternal && (
                                                                                <Icon as={FaCheck} color="green.300"
                                                                                      size="xs"/>
                                                                            )}
                                                                        </HStack>
                                                                    );
                                                                })
                                                            ) : (
                                                                <Text fontSize="xs" color="teal.200" fontStyle="italic">
                                                                    None found
                                                                </Text>
                                                            )}
                                                        </VStack>
                                                    </Box>
                                                </VStack>
                                            </Box>
                                        </HStack>

                                        <Box mt={3} p={2} bg="yellow.800" borderRadius="md" border="1px solid"
                                             borderColor="yellow.600">
                                            <Text fontSize="xs" color="yellow.100">
                                                💡 DNS hosting will not work unless the domain’s authoritative nameservers are set to our servers. Please verify via WHOIS.
                                            </Text>
                                        </Box>
                                    </Box>
                                )}

                                {issue.type === 'inconsistency' && (
                                    <Box w="100%" pl={6}>
                                        <Box p={3} bg="yellow.800" borderRadius="md" border="1px solid"
                                             borderColor="yellow.600">
                                            <VStack align="start" spacing={2}>
                                                <Text fontSize="xs" color="yellow.100">
                                                    💡 <strong>What's happening:</strong> Different DNS servers worldwide
                                                    are returning different nameserver records.
                                                </Text>

                                                <Text fontSize="xs" color="yellow.100">
                                                    🔄 <strong>Cause:</strong> DNS changes can take 24 hours to propagate
                                                    globally. Use <Text as="span"
                                                                        fontFamily="mono"
                                                                        bg="yellow.700" px={1}
                                                                        borderRadius="sm">dnschecker.org</Text> to
                                                    monitor propagation progress.
                                                </Text>
                                            </VStack>
                                        </Box>
                                    </Box>
                                )}

                                {/* Add separator between issues if there are multiple */}
                                {index < nsIssues.length - 1 && (
                                    <Box w="100%" borderBottom="1px solid" borderColor="gray.600"/>
                                )}
                            </VStack>
                        ))}
                    </VStack>
                }
            >
                <HStack
                    spacing={2}
                    px={3}
                    py={3}
                    bg="orange.100"
                    _dark={{bg: "orange.900"}}
                    borderRadius="md"
                    border="1px solid"
                    borderColor="orange.300"
                    _dark={{borderColor: "orange.600"}}
                    cursor="help"
                    minW="140px"
                    transition="all 0.2s"
                    _hover={{bg: "orange.200", _dark: {bg: "orange.800"}}}
                >
                    <Icon as={FaExclamationTriangle} color="orange.500"/>
                    <Text fontSize="sm" fontWeight="semibold" color="orange.700" _dark={{color: "orange.200"}}>
                        Nameserver issues ({nsIssues.length})
                    </Text>
                </HStack>
            </Tooltip>
        );
    };
    type RecordType = {
        ptr?: string;
        mx?: string;
        ip?: string;
        [key: string]: any;
    };

    type RecordDisplayProps = {
        id: string;
        icon: any;
        iconColor: string;
        label: string;
        externalRecord: RecordType;
        internalRecord: RecordType;
        tooltipContent: React.ReactNode;
    };


    const RecordDisplay = ({
                               id,
                               icon,
                               iconColor,
                               label,
                               externalRecord,
                               internalRecord,
                               tooltipContent,
                           }: RecordDisplayProps) => {
        const [copyValue, setCopyValue] = useState("");
        const [lastCopied, setLastCopied] = useState<string | null>(null);
        const {onCopy} = useClipboard(copyValue);
        const isCopied = lastCopied === id;

        const normalize = (value: string | undefined): string =>
            typeof value === "string" ? value.trim().toLowerCase().replace(/\.$/, "") : "";

        const getComparableValues = (a: RecordType, b: RecordType): [string, string] => {
            if (a?.ptr && b?.ptr) return [a.ptr, b.ptr];
            if (a?.mx && b?.mx) return [a.mx, b.mx];
            if (a?.ip && b?.ip) return [a.ip, b.ip];

            // No matching fields, fall back to first available pair
            if (a?.ptr || b?.ptr) return [a?.ptr || "", b?.ptr || ""];
            if (a?.mx || b?.mx) return [a?.mx || "", b?.mx || ""];
            if (a?.ip || b?.ip) return [a?.ip || "", b?.ip || ""];

            return ["", ""];
        };
        const handleCopy = () => {
            const valueToCopy = tooltipContent?.toString().replace(/[\[\]]/g, "") || "";
            setCopyValue(valueToCopy);
            setLastCopied(id);
        };

        useEffect(() => {
            if (copyValue) {
                onCopy();
            }
        }, [copyValue]);

        const [externalRaw, internalRaw] = getComparableValues(externalRecord, internalRecord);
        const normalizedExternal = normalize(externalRaw);
        const normalizedInternal = normalize(internalRaw);

        const valuesMatch = normalizedExternal === normalizedInternal;
        const hasExternalValue = normalizedExternal !== "";
        const hasInternalValue = normalizedInternal !== "";
        const hasAnyValue = hasExternalValue || hasInternalValue;
        const hasDifference = !valuesMatch && hasAnyValue;

        return (
            <Tooltip
                hasArrow
                label={
                    isCopied ? (
                        "Copied!"
                    ) : hasDifference ? (
                        <Box as="span">
                            ⚠️ <b>DNS records mismatch. Check domain nameservers.</b>
                            <br/>
                            <b>Google:</b> {normalizedExternal || "None"}
                            <br/>
                            <b>Hoster.kz:</b> {normalizedInternal || "None"}
                        </Box>
                    ) : (
                        tooltipContent
                    )
                }
                placement="bottom"
                closeOnClick={false}
            >
                <HStack
                    spacing={3}
                    cursor="pointer"
                    onClick={handleCopy}
                    _hover={{bg: useColorModeValue("gray.50", "gray.700")}}
                    p={3}
                    borderRadius="md"
                    transition="all 0.2s"
                    position="relative"
                    role="group"
                    border="2px solid"
                    borderColor={hasDifference ? "red.300" : "transparent"}
                    bg={hasDifference ? "red.50" : "transparent"}
                    _dark={{
                        borderColor: hasDifference ? "red.500" : "gray.600",
                        bg: hasDifference ? "red.900" : "transparent",
                    }}
                >
                    <HStack spacing={2} minW="120px">
                        <Icon as={icon} color={iconColor}/>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{color: "gray.200"}}>
                            {label}
                        </Text>
                        <RecordStatus hasMatch={valuesMatch} hasValues={hasAnyValue}/>
                    </HStack>

                    <Flex align="center" flex="1">
                        {valuesMatch ? (
                            <RecordValue
                                value={externalRaw || internalRaw}
                                isEmpty={!hasAnyValue}
                            />
                        ) : (
                            <VStack align="start" spacing={1} flex="1">
                                <RecordValue
                                    value={externalRaw}
                                    isEmpty={!hasExternalValue}
                                    isHighlighted={hasExternalValue}
                                />
                                <RecordValue
                                    value={internalRaw}
                                    isEmpty={!hasInternalValue}
                                    isHighlighted={hasInternalValue}
                                />
                            </VStack>
                        )}

                        <Icon
                            as={FaCopy}
                            color="gray.400"
                            ml={2}
                            fontSize="xs"
                            opacity="0"
                            _groupHover={{opacity: "1"}}
                            transition="opacity 0.2s"
                        />
                    </Flex>

                    {isCopied && (
                        <Text
                            position="absolute"
                            right="0"
                            top="-20px"
                            color="green.500"
                            fontSize="xs"
                            fontWeight="bold"
                            px={2}
                            py={1}
                            borderRadius="md"
                            bg={useColorModeValue("white", "gray.800")}
                            boxShadow="sm"
                        >
                            Copied!
                        </Text>
                    )}
                </HStack>
            </Tooltip>
        );
    };
    const ZonemasterSummaryDisplay = ({zonemasters, icon, iconColor}) => {
        const [copyValue, setCopyValue] = useState("");
        const [lastCopied, setLastCopied] = useState(null);
        const {onCopy} = useClipboard(copyValue);

        useEffect(() => {
            if (copyValue) {
                onCopy();
            }
        }, [copyValue, onCopy]);

        const summary = useMemo(() => {
            const grouped = {};

            if (!Array.isArray(zonemasters)) return [];

            for (const z of zonemasters) {
                if (!z || typeof z !== "object" || !z.ip) continue;

                const ip = z.ip;
                const host = z.host || "Unknown";
                const ptr = z.ptr || null;

                if (!grouped[ip]) {
                    grouped[ip] = {
                        ip,
                        ptr,
                        hosts: [host]
                    };
                } else {
                    grouped[ip].hosts.push(host);
                    if (!grouped[ip].ptr && ptr) {
                        grouped[ip].ptr = ptr; // use first non-null ptr
                    }
                }
            }

            return Object.values(grouped);
        }, [zonemasters]);

        const handleCopy = (key, entry) => {
            // Create copy content without separators, just space-separated values
            const copyContent = entry.hosts.map(host =>
                `${host} ${entry.ip} ${entry.ptr || 'no-PTR'}`
            ).join('\n');

            setCopyValue(copyContent);
            setLastCopied(key);

            // Clear the "Copied!" state after 2 seconds
            setTimeout(() => {
                setLastCopied(null);
            }, 2000);
        };

        const createTooltipContent = (entry) => {
            // Find the maximum width for each column
            const maxNameserverWidth = Math.max(10, ...entry.hosts.map(host => host.length));
            const maxIPWidth = Math.max(9, entry.ip.length);

            // Create header row
            const header = "Nameserver".padEnd(maxNameserverWidth) + " | " +
                "Master IP".padEnd(maxIPWidth) + " | " + "Master Host";
            const separator = "-".repeat(maxNameserverWidth) + "-+-" +
                "-".repeat(maxIPWidth) + "-+-" + "-".repeat(11);

            // Create data rows
            const rows = entry.hosts.map(host => {
                const nameserver = host.padEnd(maxNameserverWidth);
                const masterIP = entry.ip.padEnd(maxIPWidth);
                const masterHost = (entry.ptr || 'no PTR');
                return nameserver + " | " + masterIP + " | " + masterHost;
            });

            return [header, separator, ...rows].join("\n");
        };

        return (
            <VStack align="stretch" spacing={4}>
                {summary.map((entry, idx) => {
                    const label = entry.ptr || entry.ip;
                    const tooltip = createTooltipContent(entry);
                    const id = `${entry.ip}-${idx}`;
                    const isCopied = lastCopied === id;

                    return (
                        <Tooltip
                            key={id}
                            label={isCopied ? "Copied!" : tooltip}
                            hasArrow
                            placement="bottom"
                            closeOnClick={false}
                            fontSize="xs"
                            fontFamily="monospace"
                            whiteSpace="pre"
                            maxW="400px"
                        >
                            <HStack
                                spacing={3}
                                cursor="pointer"
                                onClick={() => handleCopy(id, entry)}
                                _hover={{bg: useColorModeValue("gray.50", "gray.700")}}
                                p={3}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.300"
                                _dark={{borderColor: "gray.600"}}
                                role="group"
                                position="relative"
                            >
                                <HStack spacing={2} minW="200px">
                                    {icon && <Icon as={icon} color={iconColor}/>}
                                    <Text fontSize="sm" fontWeight="bold" color="gray.700" _dark={{color: "gray.200"}}>
                                        Zonemaster:
                                    </Text>
                                    <Text fontSize="sm">
                                        {label}
                                    </Text>
                                </HStack>

                                <Flex flex="1" justify="flex-end">
                                    <Icon
                                        as={FaCopy}
                                        fontSize="sm"
                                        color="gray.400"
                                        opacity="0"
                                        _groupHover={{opacity: 1}}
                                        transition="opacity 0.2s"
                                    />
                                </Flex>

                                {isCopied && (
                                    <Text
                                        position="absolute"
                                        right="0"
                                        top="-20px"
                                        color="green.500"
                                        fontSize="xs"
                                        fontWeight="bold"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        bg={useColorModeValue("white", "gray.800")}
                                        boxShadow="sm"
                                    >
                                        Copied!
                                    </Text>
                                )}
                            </HStack>
                        </Tooltip>
                    );
                })}
            </VStack>
        );
    };

    return (
        <Box
            width="100%"
            p={4}
            borderRadius="md"
            borderWidth="1px"
            boxShadow="sm"
            bg={bgColor}
        >
            <HStack spacing={6} justify="flex-start" flexWrap="wrap">
                {renderNsStatusBadge()}
                <RecordDisplay
                    id="googleARecord"
                    icon={FaGlobe}
                    iconColor={iconColorA}
                    label="A Record:"
                    externalRecord={googleARecord}
                    internalRecord={internalARecord}
                    tooltipContent={getTooltipContent(googleARecord)}
                />

                <RecordDisplay
                    id="googleMxRecord"
                    icon={FaEnvelope}
                    iconColor={iconColorB}
                    label="MX Record:"
                    externalRecord={googleMxRecord}
                    internalRecord={internalMxRecord}
                    tooltipContent={getTooltipContent(googleMxRecord)}
                />

                <ZonemasterSummaryDisplay
                    zonemasters={zonemasters?.zonemasters || []}
                    icon={FaServer}
                    iconColor="yellow.500"
                />
            </HStack>
        </Box>
    );
};

export default DnsInfoBar;
