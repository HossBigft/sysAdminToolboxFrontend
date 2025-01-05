import React from "react";
import { Input } from "@chakra-ui/react";

const SearchInput = ({ searchTerm, setSearchTerm, handleKeyPress }) => {
  return (
    <Input
      placeholder="Search subscriptions..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyPress={handleKeyPress}
      width="100%"
    />
  );
};

export default SearchInput;
