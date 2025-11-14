import { Loader2, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { SearchQuery } from "@/components/otp-generator/type";
import React from "react";

type Props = {
  searchQuery: SearchQuery;
  onSearchQueryChange: (ev: ChangeEvent<HTMLInputElement>) => void;
  onSearchFocus?: () => void;
  placeholder?: string;
  className?: string;
};

function SearchInput({
  searchQuery,
  onSearchQueryChange,
  onSearchFocus,
  placeholder,
  className,
}: Props) {
  return (
    <>
      <Input
        autoComplete=""
        className={cn("pr-8", className)}
        name="search"
        value={searchQuery.query}
        onChange={onSearchQueryChange}
        onFocus={onSearchFocus}
        placeholder={placeholder || "Search"}
        disabled={searchQuery.isSearching}
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {searchQuery.isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin stroke-primary stroke-1" />
        ) : (
          <SearchIcon className="text-muted-foreground w-5" />
        )}
      </div>
    </>
  );
}

export const SearchInputMemo = React.memo(SearchInput);
