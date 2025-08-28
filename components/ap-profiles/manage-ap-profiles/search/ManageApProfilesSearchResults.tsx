import { GeneratorSearchResultsProps } from "@/components/otp-generator/type";
import { cn } from "@/lib/utils";
export function ManageApProfilesSearchResults({
  result,
  handleSelectItem,
}: GeneratorSearchResultsProps) {
  return (
    <>
      {result?.data.length === 0 ? (
        <li className="text-center text-sm text-gray-500 py-2">
          No results found
        </li>
      ) : (
        result.data.map((item: any) => {
          const statusText =
            item.status == "active"
              ? `Currently assigned to ${item.ap_profile.profile_name}`
              : item.status;
          const isProfileAvailable = item.status == "available";
          return (
            <li
              key={item.id}
              className={cn(
                !result.data?.length || !isProfileAvailable
                  ? "hover:cursor-not-allowed"
                  : "hover:cursor-pointer",
                "flex hover:bg-muted gap-2 px-3 py-2 rounded-lg"
              )}
              onClick={() => {
                if (isProfileAvailable) {
                  handleSelectItem(item);
                }
              }}
            >
              <div className="flex flex-col">
                <div className="font-semibold text-sm">
                  {item.fb_owner_name}
                </div>
                <p className="text-sm text-gray-500">{statusText}</p>
              </div>
            </li>
          );
        })
      )}
    </>
  );
}
