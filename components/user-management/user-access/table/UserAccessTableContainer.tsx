"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { SearchInput } from "@/components/shared/search/SearchInput";
import { UserAccessTable } from "./UserAccessTable";
import { UserAccessDialog } from "../dialog/UserAccessDialog";
import { useUserAccess } from "../hooks/useUserAccess";
import { UserAccessTableContainerProps } from "../UserAccess.types";

export function UserAccessTableContainer({
  response,
}: UserAccessTableContainerProps) {
  const {
    dialogState,
    editingRow,
    isAddingNew,
    tableData,
    searchQuery,
    menuAccess,
    selectedBrandAccess,
    userAccessForm,

    menuStructure,

    searchParamCurrentPage,
    searchParamTotalPages,
    searchParamLimit,

    handleAddUserEntry,
    handleEditChange,
    handleSubmit,
    handleBrandChange,
    handleMenuChange,
    handeUserAccessDialogOpenChange,
    handlePagination,
    handleSearchQueryChange,
    handleSearchFocus,
  } = useUserAccess({ response });

  return (
    <>
      <UserAccessDialog
        isAddingNew={isAddingNew}
        isActionDisabled={false}
        menuStructure={menuStructure}
        open={dialogState.userAccess}
        onBrandChange={handleBrandChange}
        onMenuChange={handleMenuChange}
        onOpenChange={handeUserAccessDialogOpenChange}
        onSubmit={handleSubmit}
        selectedBrandAccess={selectedBrandAccess}
        selectedMenuAccess={menuAccess}
        userAccessForm={userAccessForm}
      />
      <div className="flex justify-start gap-2 mt-4 w-full">
        <Button
          className="cursor-pointer h-9"
          variant="default"
          onClick={handleAddUserEntry}
        >
          New User Entry
        </Button>
        <div className="relative w-[30%]">
          <SearchInput
            className="h-9"
            searchQuery={searchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchQueryChange={handleSearchQueryChange}
            placeholder="Search a user"
          />
        </div>
      </div>
      <ScrollArea className="h-[70dvh] mt-4">
        <UserAccessTable
          data={tableData}
          editingRow={editingRow}
          handleEditChange={handleEditChange}
        />
      </ScrollArea>
      <Pagination
        currentPage={Number(searchParamCurrentPage)}
        limit={searchParamLimit}
        total_pages={Number(searchParamTotalPages)}
        handlePagination={handlePagination}
      />
    </>
  );
}
