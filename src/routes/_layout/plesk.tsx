import React, { useState, useEffect } from "react";
import { ChakraProvider, VStack, Box, Text } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import SearchInput from "./components/Search/SearchInput";
import SubscriptionTable from "./components/Table/SubscriptionTable";
import { useToastHelpers } from "./components/Helpers/ToastHelpers";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [lastValidData, setLastValidData] = useState([]);
  const [clickedItem, setClickedItem] = useState(null);
  const queryClient = useQueryClient();
  const toast = useToastHelpers();


  const handleKeyPress = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      setLastValidData([]);
      setTriggerSearch(true);
    }
  };

  const handleLoginLinkClick = (item) => {
    queryClient.removeQueries(["subscriptionLoginLink"]);
    setClickedItem(item);
  };

  return (
    <ChakraProvider>
      <VStack spacing={4} width="100%" margin="50px auto" maxWidth="1200px">
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleKeyPress={handleKeyPress}
        />
        <Box width="100%">
          {isLoading && <Text>Loading...</Text>}
          {error && <Text>Error: {error.message}</Text>}
          <SubscriptionTable
            data={subscriptionData || lastValidData}
            handleLoginLinkClick={handleLoginLinkClick}
          />
        </Box>
      </VStack>
    </ChakraProvider>
  );
}

