import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { AdData } from "../AdCheckerContainer";
import { AdCheckerAction } from "../action/AdCheckerAction";

export function useAdColumns(onViewCreatives: (adCreatives: any) => void) {
  const adColumns: ColumnDef<AdData>[] = useMemo(
    () => [
      {
        accessorKey: "profile",
        header: "Profile",
        size: 80,
      },
      {
        accessorKey: "ad_account",
        header: "Ad Account",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>().toLocaleLowerCase();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 150,
      },
      {
        accessorKey: "ad_checker_summary",
        header: "Ad Checker Summary",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          return (
            <div className="whitespace-normal">
              <ul>
                {cellValue.message.map((adCheckerSummary: any, idx: number) => (
                  <li key={idx}>- {adCheckerSummary}</li>
                ))}
              </ul>
            </div>
          );
        },
        minSize: 200,
      },
      {
        accessorKey: "account_status",
        header: "Account Status",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>().toLocaleLowerCase();
          const normalCase =
            cellValue.charAt(0).toUpperCase() +
            cellValue.substr(1, cellValue.length);
          return (
            <>
              {cellValue && (
                <Badge variant="secondary" className="text-xs">
                  {normalCase}
                </Badge>
              )}
            </>
          );
        },
        size: 80,
      },
      {
        accessorKey: "disable_reason",
        header: "Disable Reason",
        size: 80,
      },
      {
        accessorKey: "campaign_name",
        header: "Campaign Name",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 250,
      },
      {
        accessorKey: "daily_budget",
        header: "Daily Budget",
        cell: ({ getValue, row }) => {
          const adCheckerSummary: { code: number } =
            row.getValue("ad_checker_summary");
          if (adCheckerSummary.code == 404) {
            return "";
          }
          const cellValue = getValue<string | number>();
          if (typeof cellValue === "undefined") return <>Daily budget error</>;

          const realValue = getValue<number>();
          return realValue ? `$${realValue.toLocaleString()}` : "";
        },
        size: 50,
      },
      {
        accessorKey: "spend",
        header: "Spend",
        cell: ({ getValue, row }) => {
          const adCheckerSummary: { code: number } =
            row.getValue("ad_checker_summary");
          if (adCheckerSummary.code == 404) {
            return "";
          }
          const realValue = getValue<number>();
          return realValue ? `$${realValue.toLocaleString()}` : "";
        },
        size: 80,
      },
      {
        accessorKey: "domain_name",
        header: "Domain Name",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          return (
            <div className="whitespace-normal">
              {cellValue.map((domain: any) => (
                <div key={domain.name}>
                  {domain.name} - {domain.status}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "targeting_geo",
        header: "Targeting Geo",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          if (!cellValue.length) return null;
          return (
            <div className="whitespace-normal">{cellValue.join(", ")}</div>
          );
        },
        size: 50,
      },
      {
        accessorKey: "links",
        header: "Ad Creatives",
        cell: ({ getValue }) => {
          const adCreatives = getValue<Record<string, any>>();
          if (adCreatives.length == 0) {
            return (
              <div className="text-xs text-center text-muted-foreground">
                No Ad Creatives
              </div>
            );
          }
          return (
            <AdCheckerAction
              onViewCreatives={() => onViewCreatives(adCreatives)}
            />
          );
        },
        size: 150,
      },
    ],
    [onViewCreatives]
  );

  return adColumns;
}
