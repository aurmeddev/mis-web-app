import { GeneratorSearchResultsProps } from "@/components/otp-generator/type";
import { cn } from "@/lib/utils";
export function ApProfilesSearchResults({
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
            item.description.charAt(0).toUpperCase() +
            item.description.substr(1, item.description.length);
          return (
            <li
              key={item.id}
              className={cn(
                !result.data?.length
                  ? "hover:cursor-not-allowed"
                  : "hover:cursor-pointer",
                "flex hover:bg-muted gap-2 px-3 py-2 rounded-lg"
              )}
              onClick={() => handleSelectItem(item)}
            >
              <div className="flex flex-col">
                <div className="font-semibold text-sm">{item.profile_name}</div>
                <p className="text-sm text-gray-500">{normalCase}</p>
              </div>
            </li>
          );
        })
      )}
    </>
  );
}
