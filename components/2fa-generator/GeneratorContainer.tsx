"use client";
import { Search, SearchIcon } from "lucide-react";
import { Input } from "../ui/input";
import { GeneratorCard } from "./GeneratorCard";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useDebouncedCallback } from "use-debounce";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { SearchResult } from "../search/SearchResult";
import { OtpGeneratorService } from "@/lib/features/security/otp-generator/OtpGeneratorService";
import { GeneratorCardLoading } from "./GeneratorCardLoading";
import { SearchQuery } from "./type";
import { cn } from "@/lib/utils";
import { GeneratorSearchResults } from "./search/GeneratorSearchResults";

export function GeneratorContainer() {
  const profilesService = new ApProfilesService();
  const otpGeneratorService = new OtpGeneratorService();

  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });
  const [currentOTP, setCurrentOTP] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearchQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, query: ev.target.value });
  };

  const handleDebounce = useDebouncedCallback(async (data: string) => {
    setSearchQuery({ ...searchQuery, isSearching: true });
    const response = await profilesService.find({
      method: "find-one",
      searchKeyword: data,
    });
    setSearchQuery({ ...searchQuery, result: response, isSearching: false });
    setShowResults(true);
  }, 500);

  const handleSearchFocus = () => {
    if (searchQuery.result.data?.length) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const generateOTP = async (calledAgain: boolean) => {
    if (!searchQuery.selectedResult) return;
    const response = await otpGeneratorService.generate({
      secret: searchQuery.selectedResult.fb_account.app_2fa_key,
    });

    const updateOTP = () => setCurrentOTP(response.data.otp);
    if (calledAgain) {
      updateOTP();
    } else {
      startTransition(updateOTP);
    }
  };

  const handleSelectItem = (item: any) => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      selectedResult: item,
    }));
    setShowResults(false);
  };

  useEffect(() => {
    if (searchQuery.query) {
      handleDebounce(searchQuery.query);
    }
  }, [searchQuery.query]);

  useEffect(() => {
    if (!searchQuery.selectedResult) return;
    setCurrentOTP("");
    generateOTP(false);
  }, [searchQuery.selectedResult]);

  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div className="font-medium mb-4 text-lg">Generate OTP</div>
      <div className="flex flex-col gap-10">
        <div className="relative max-w-xs w-[25%]">
          <Input
            autoComplete=""
            className="pr-8"
            name="search"
            value={searchQuery.query}
            onChange={handleSearchQueryChange}
            onFocus={handleSearchFocus}
            placeholder="Search profile"
            disabled={searchQuery.isSearching}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {searchQuery.isSearching ? (
              <ReloadIcon className="h-4 w-4 animate-spin stroke-primary stroke-1" />
            ) : (
              <SearchIcon className="text-muted-foreground w-5" />
            )}
          </div>

          {showResults && (
            <SearchResult setShowResults={setShowResults}>
              <GeneratorSearchResults
                result={searchQuery.result}
                handleSelectItem={handleSelectItem}
              />
            </SearchResult>
          )}
        </div>

        {isPending && !currentOTP ? <GeneratorCardLoading /> : ""}
        {searchQuery.selectedResult && currentOTP && (
          <GeneratorCard
            selectedResult={searchQuery.selectedResult}
            otp={currentOTP}
            generateOTP={generateOTP}
          />
        )}
        {!searchQuery.selectedResult && !currentOTP && (
          <div className="absolute gap-4 left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col justify-center items-center">
            <div className="bg-muted p-6 rounded-full">
              <Search className="h-12 text-muted-foreground w-12" />
            </div>
            <div className="font-semibold text-muted-foreground text-lg">
              Search for a profile to get started.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
