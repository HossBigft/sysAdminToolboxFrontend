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
import {useState, useEffect} from "react";

const DnsInfoBar = ({
                        internalARecord,
                        internalMxRecord,
                        googleARecord,
                        googleMxRecord,
                        zoneMaster,
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

    function isNsRecordsMatch(response: ResponseShape): boolean {
        if (!Array.isArray(response.records)) {
            return false; // or true if you want to treat "no records" as "no mismatches"
        }

        const normalize = (arr: string[]): string => [...arr].sort().join('|');

        const nonEmpty = response.records
            .filter((obj): obj is Required<NSRecordObject> =>
                Array.isArray(obj.records) && obj.records.every(r => typeof r === 'string')
            );

        if (nonEmpty.length === 0) {
            return true; // nothing to compare, treat as OK
        }

        const base = normalize(nonEmpty[0].records);

        return nonEmpty.every(obj => normalize(obj.records) === base)
    }

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
                if (typeof record === 'string') return record.toLowerCase().trim();
                return String(record.value || record.target || record).toLowerCase().trim();
            }).filter(Boolean).sort();
        }
        if (typeof records === 'string') return [records.toLowerCase().trim()];
        return [String(records.value || records.target || records).toLowerCase().trim()].filter(Boolean);
    };

    const authNsRecords = normalizeNsRecords(authoritativeNsRecords.records);
    const normalizedPublicNsRecords = normalizeNsRecords(publicNsRecords.records);
    const internalNsRecords = internalDnsServers.map(server => server.toLowerCase());
    let isSubsetArray = (parentArray, subsetArray) => {

        let result = subsetArray.every((el) => {
            return parentArray.includes(el)
        })

        return result
    }
    // Check for NS record issues
    const checkNsIssues = (nsRecordsAuthoritativeNs, nsRecordsPublicNs) => {
        const issues = [];

        // Check if authoritative NS records match internal DNS servers
        const authMatchesInternal = isSubsetArray(internalNsRecords, nsRecordsAuthoritativeNs);

        if (!authMatchesInternal && authNsRecords.length > 0) {
            issues.push("NS Mismatch⚠: domain is using third-party nameservers. Authoritative NS records differ from internal NS domains.");
        }
        if (nsRecordsPublicNs && !isNsRecordsMatch(nsRecordsPublicNs)) {
            issues.push("Public NS Inconsistency ⚠:NS records from public NS and Authoritative NS differ. Authoritative domain servers were changed less than 24 hours ago. Use dnschecker.org to confirm. ");
        }

        return issues;
    }

    const nsIssues = checkNsIssues(authNsRecords, normalizedPublicNsRecords);

    const renderNsStatusBadge = () => {
        if (nsIssues.length === 0) return null;

        return (
            <Tooltip
                hasArrow
                placement="bottom"
                bg="gray.900"
                color="white"
                maxWidth="lg"
                label={
                    <VStack align="start" spacing={4} p={3}>

                        <VStack align="start" spacing={2} w="100%">
                            {nsIssues.map((issue, index) => (
                                <Text key={index} fontSize="sm" color="red.300">
                                    • {issue}
                                </Text>
                            ))}
                        </VStack>

                        <Box w="100%" borderTop="2px" borderColor="gray.600" pt={3}>

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
                                                    internalNsRecords.map((server, index) => (
                                                        <Text
                                                            key={index}
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
                                                    authNsRecords.map((server, index) => {
                                                        const isInInternal = internalNsRecords.includes(server);
                                                        return (
                                                            <HStack
                                                                key={index}
                                                                w="100%"
                                                                bg={isInInternal ? "teal.600" : "red.600"}
                                                                px={2}
                                                                py={1}
                                                                borderRadius="sm"
                                                                border={isInInternal ? "none" : "1px solid"}
                                                                borderColor={isInInternal ? "transparent" : "red.400"}
                                                            >
                                                                {!isInInternal && (
                                                                    <Icon as={FaExclamationTriangle} color="red.200"
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
                                                                    <Icon as={FaCheck} color="green.300" size="xs"/>
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
                                    💡 <strong>Why this matters:</strong> Authoritative nameservers must match intenal
                                    for domain control via Plesk or hosted DNS. Verify current settings using WHOIS.
                                </Text>
                            </Box>
                        </Box>
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
                        Nameservers issues ({nsIssues.length})
                    </Text>
                </HStack>
            </Tooltip>
        );
    };
    const RecordDisplay = ({
                               icon,
                               iconColor,
                               label,
                               externalRecordValue,
                               internalRecordValue,
                               tooltipContent,
                               id,
                           }) => {
        const {onCopy} = useClipboard(copyValue);
        const isCopied = lastCopied === id;

        const handleCopy = () => {
            const valueToCopy = tooltipContent.replace(/[\[\]]/g, "");
            setCopyValue(valueToCopy);
            setLastCopied(id);
        };

        useEffect(() => {
            if (copyValue) {
                onCopy();
            }
        }, [copyValue]);


        const normalizedExternal = normalize(externalRecordValue);
        const normalizedInternal = normalize(internalRecordValue);
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
                        bg: hasDifference ? "red.900" : "transparent"
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
                                value={externalRecordValue || internalRecordValue}
                                isEmpty={!hasAnyValue}
                            />
                        ) : (
                            <VStack align="start" spacing={1} flex="1">
                                <RecordValue
                                    value={externalRecordValue}
                                    isEmpty={!hasExternalValue}
                                    isHighlighted={hasExternalValue}
                                />
                                <RecordValue
                                    value={internalRecordValue}
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
                    label="A Record"
                    externalRecordValue={googleARecord?.ptr || googleARecord?.ip || ""}
                    internalRecordValue={internalARecord?.ptr || internalARecord?.ip || ""}
                    tooltipContent={getTooltipContent(googleARecord)}
                />

                <RecordDisplay
                    id="googleMxRecord"
                    icon={FaEnvelope}
                    iconColor={iconColorB}
                    label="MX Record"
                    externalRecordValue={googleMxRecord?.ptr || googleMxRecord?.mx || googleMxRecord?.ip}
                    internalRecordValue={internalMxRecord?.ptr || internalMxRecord?.mx || internalMxRecord?.ip}
                    tooltipContent={getTooltipContent(googleMxRecord)}
                />

                <RecordDisplay
                    id="zoneMaster"
                    icon={FaServer}
                    iconColor={iconColorC}
                    label="ZoneMaster"
                    externalRecordValue={zoneMaster?.ptr || zoneMaster?.ip}
                    internalRecordValue={zoneMaster?.ptr || zoneMaster?.ip}
                    tooltipContent={getTooltipContent(zoneMaster)}
                />
            </HStack>
        </Box>
    );
};

export default DnsInfoBar;
