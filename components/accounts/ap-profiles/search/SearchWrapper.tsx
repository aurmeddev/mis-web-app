import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Dispatch, SetStateAction } from "react";
import { SearchInputMemo } from "@/components/shared/search/SearchInput";
import { SearchResultContainer } from "@/components/shared/search/SearchResultContainer";

type SearchWrapperProps = {
  searchQuery: any;
  onSearchQueryChange: (q: any) => void;
  onSearchFocus: () => void;
  onRemoveSelected: () => void;
  showResults: boolean;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  SelectedRenderer: React.ReactNode; // custom selected UI
  ResultsRenderer: React.ReactNode; // custom results component
};

export function SearchWrapper({
  searchQuery,
  onSearchQueryChange,
  onSearchFocus,
  onRemoveSelected,
  showResults,
  setShowResults,
  disabled,
  SelectedRenderer,
  ResultsRenderer,
}: SearchWrapperProps) {
  return (
    <>
      <SearchInputMemo
        className={
          searchQuery.selectedResult || disabled ? "pointer-events-none" : ""
        }
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
        onSearchFocus={onSearchFocus}
      />

      {searchQuery.selectedResult && (
        <div className="absolute bg-primary-foreground top-1/2 -translate-y-1/2 flex items-center gap-2 left-2 rounded px-2 py-1">
          {SelectedRenderer}

          <Button
            variant="ghost"
            className="bg-transparent cursor-pointer h-3 rounded w-3 text-muted-foreground"
            onClick={onRemoveSelected}
            type="button"
            disabled={disabled}
          >
            <X />
          </Button>
        </div>
      )}

      {showResults && (
        <SearchResultContainer setShowResults={setShowResults}>
          {ResultsRenderer}
        </SearchResultContainer>
      )}
    </>
  );
}
