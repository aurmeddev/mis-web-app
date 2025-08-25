import { cn } from "@/lib/utils";
import { GeneratorSearchResultsProps } from "../type";

export function GeneratorSearchResults({
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
          const normalCase =
            item.status.charAt(0).toUpperCase() +
            item.status.substr(1, item.status.length);
          const isProfileAvailable = item.status == "available";
          const status = isProfileAvailable
            ? "There is no FB account assigned to this AP Profile yet. Unable to generate an OTP."
            : normalCase;
          return (
            <li
              key={item.id}
              className={cn(
                !result.data?.length || isProfileAvailable
                  ? "hover:cursor-not-allowed"
                  : "hover:cursor-pointer",
                "flex hover:bg-muted gap-2 px-3 py-2 rounded-lg"
              )}
              onClick={() => {
                if (!isProfileAvailable) {
                  handleSelectItem(item);
                }
              }}
            >
              <div className="flex flex-col">
                <div className="font-semibold text-sm">{item.profile_name}</div>
                <p className="text-sm text-gray-500">{status}</p>
              </div>
            </li>
          );
        })
      )}
    </>
  );
}
