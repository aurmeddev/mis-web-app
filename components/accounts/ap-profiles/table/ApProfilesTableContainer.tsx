"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApProfilesTableMemo } from "./ApProfilesTable";
import { ManageApProfilesDialog } from "../dialog/ApProfilesDialog";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { ApProfilesSearchResults } from "../search/ApProfilesSearchResults";
import { SearchWrapper } from "../search/SearchWrapper";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { ApProfilesTableContainerProps } from "../ApProfiles.types";
import { useApProfiles } from "../hooks/useApProfiles";

export function ManageApProfilesTableContainer({
  brands,
  response,
  hasAccessToMarketingApiAccessToken,
}: ApProfilesTableContainerProps) {
  const {
    // States & Data
    isDialogOpen,
    setIsDialogOpen,
    editingData,
    form,
    tableData,
    step,
    canSave,
    isSubmitInProgress,
    showResults,
    setShowResults,
    profileEditState,
    searchQuery,
    accessTokenState,
    selectedBrandAccess,

    // Pagination Params
    searchParamCurrentPage,
    searchParamTotalPages,
    searchParamLimit,

    // Handlers
    handleInputChange,
    handleSubmit,
    handleEditChange,
    handlePagination,
    handleSearchQueryChange,
    handleSearchFocus,
    handleSelectItem,
    handleRemoveSelected,
    handleNewProfile,
    handleUpdateStep,
    handleModifyEditingData,
    handleAccessTokenStateChange,
    handleBrandChange,
  } = useApProfiles({ brands, response });

  return (
    <>
      <ManageApProfilesDialog
        accessTokenState={accessTokenState}
        brands={brands}
        canSave={canSave}
        editingData={editingData}
        form={form}
        isDialogOpen={isDialogOpen}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleModifyEditingData={handleModifyEditingData}
        hasAccessToMarketingApiAccessToken={hasAccessToMarketingApiAccessToken}
        isActionDisabled={isSubmitInProgress}
        onAccessTokenStateChange={handleAccessTokenStateChange}
        onUpdateStep={handleUpdateStep}
        onBrandChange={handleBrandChange}
        selectedBrandAccess={selectedBrandAccess}
        setIsDialogOpen={setIsDialogOpen}
        step={step}
      />
      <div className="flex justify-start gap-2 2xl:w-1/3 mt-4 w-[40%]">
        <Button
          className="cursor-pointer h-8 text-white"
          variant="default"
          onClick={handleNewProfile}
        >
          New Profile Entry
        </Button>

        <div className="relative w-full">
          <SearchWrapper
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            onSearchFocus={handleSearchFocus}
            onRemoveSelected={handleRemoveSelected}
            showResults={showResults}
            setShowResults={setShowResults}
            SelectedRenderer={
              <div className="text-sm">
                {searchQuery.selectedResult?.profile_name}
              </div>
            }
            ResultsRenderer={
              <ApProfilesSearchResults
                result={searchQuery.result}
                handleSelectItem={handleSelectItem}
              />
            }
          />
        </div>
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <ApProfilesTableMemo
          data={tableData}
          handleEditChange={handleEditChange}
          profileEditState={profileEditState}
        />

        <Pagination
          currentPage={Number(searchParamCurrentPage)}
          limit={searchParamLimit}
          total_pages={Number(searchParamTotalPages)}
          handlePagination={handlePagination}
        />
      </ScrollArea>
    </>
  );
}

export const getTokens = async (params: {
  app_secret_key?: string;
  marketing_api_access_token?: string;
  type: "encrypt" | "decrypt";
}) => {
  const decipher = new CryptoClientService();
  const tokens: any = {};

  const { app_secret_key, marketing_api_access_token } = params;
  const sensitiveData: any = {
    app_secret_key,
    marketing_api_access_token,
  };

  if (params.type === "encrypt") {
    for (const prop of Object.keys(sensitiveData)) {
      const value = sensitiveData[prop];
      if (value) {
        const { isSuccess, encryptedData, message } = await decipher.encrypt({
          data: value, // Decrypt
        });
        tokens[prop] = isSuccess ? encryptedData : message;
      }
    }
  } else {
    for (const prop of Object.keys(sensitiveData)) {
      const value = sensitiveData[prop];
      if (value) {
        const { isSuccess, decryptedData, message } = await decipher.decrypt({
          data: value, // Decrypt
        });
        tokens[prop] = isSuccess ? decryptedData : message;
      }
    }
  }

  return tokens;
};
