import { Input } from '@chakra-ui/react';

const SearchInput = ({ value, onChange, onKeyPress, isDisabled }) => (
  <Input
    placeholder="Search subscriptions..."
    value={value}
    onChange={onChange}
    onKeyPress={onKeyPress}
    width="100%"
    isDisabled={isDisabled}
  />
);

export default SearchInput;