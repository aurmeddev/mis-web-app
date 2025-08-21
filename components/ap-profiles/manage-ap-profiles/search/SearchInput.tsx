import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Search } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  onSearch: (value: string) => void;
  isSearching: boolean;
};

export function SearchInput({
  placeholder,
  onSearch,
  isSearching,
}: SearchInputProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const sizeStyle = { width: "1rem", height: "1rem" };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery]);

  return (
    <div className="relative w-full">
      <Input
        className="h-8 w-full"
        placeholder={placeholder ? placeholder : "Search..."}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isSearching ? (
        <div className="absolute right-3 -translate-y-1/2 top-1/2">
          <LoaderCircle className="animate-spin" style={sizeStyle} />
        </div>
      ) : (
        <Search className="absolute h-4 right-2 -translate-y-1/2 top-1/2" />
      )}
    </div>
  );
}
