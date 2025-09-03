"use client";
import { Search } from "lucide-react";
import { GeneratorCard } from "./GeneratorCard";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { SearchResultContainer } from "../search/SearchResultContainer";
import { OtpGeneratorService } from "@/lib/features/security/otp-generator/OtpGeneratorService";
import { GeneratorCardLoading } from "./GeneratorCardLoading";
import { SearchQuery } from "./type";
import { GeneratorSearchResults } from "./search/GeneratorSearchResults";
import { SearchInput } from "../search/SearchInput";

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
    const secretKey = searchQuery.selectedResult.fb_account.app_2fa_key;
    let response = {
      data: {
        otp: "",
      },
    };
    if (!secretKey) {
      setCurrentOTP("No secret key was provided");
      return;
    }

    response = await otpGeneratorService.generate({
      secret: secretKey,
    });

    const updateOTP = () => setCurrentOTP(response.data?.otp);
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
      <div className="font-medium mb-1 text-lg">Get OTP</div>
      <div className="text-muted-foreground mb-4">
        Generate a secure one-time password (OTP).
      </div>
      <div className="flex flex-col gap-10">
        <div className="relative max-w-xs w-[25%]">
          <SearchInput
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            onSearchFocus={handleSearchFocus}
            placeholder="Search profile"
          />

          {showResults && (
            <SearchResultContainer setShowResults={setShowResults}>
              <GeneratorSearchResults
                result={searchQuery.result}
                handleSelectItem={handleSelectItem}
              />
            </SearchResultContainer>
          )}
        </div>

        {searchQuery.selectedResult ? (
          <GeneratorCard
            selectedResult={searchQuery.selectedResult}
            otp={currentOTP}
            generateOTP={generateOTP}
          />
        ) : isPending ? (
          <GeneratorCardLoading />
        ) : (
          ""
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
