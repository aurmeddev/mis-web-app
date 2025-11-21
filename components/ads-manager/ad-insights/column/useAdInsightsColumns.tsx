import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AdInsightsData } from "../AdInsights.types";

export function useAdInsightsColumn() {
  const adColumns: ColumnDef<AdInsightsData>[] = useMemo(
    () => [
      {
        accessorKey: "profile",
        header: "Profile",
        size: 80,
      },
      {
        accessorKey: "ad_account_name",
        header: "Ad Account",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 150,
      },
      {
        accessorKey: "ad_insights_summary",
        header: "Ad Insights Summary",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          const isInternaServerError = cellValue.code === 500;
          const isAdInsightsSummaryOk = cellValue.code === 200;
          const isAdInsightsSummaryNoAdset = cellValue.code === 404;
          const isAdInsightsSummaryProfileIssue = cellValue.code === 400;
          return (
            <div className="whitespace-normal">
              <ul>
                {cellValue.message.map(
                  (adInsightsSummary: any, idx: number) => (
                    <li key={idx}>
                      {isAdInsightsSummaryOk ? (
                        <Badge className="bg-green-500">
                          {adInsightsSummary}
                        </Badge>
                      ) : isAdInsightsSummaryNoAdset ? (
                        <Badge variant={"secondary"}>{adInsightsSummary}</Badge>
                      ) : isAdInsightsSummaryProfileIssue ? (
                        <Badge variant={"destructive"}>
                          {adInsightsSummary}
                        </Badge>
                      ) : (
                        <>- {adInsightsSummary} </>
                      )}
                      {isInternaServerError && (
                        <Badge className="uppercase" variant={"destructive"}>
                          {adInsightsSummary}
                        </Badge>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          );
        },
        minSize: 200,
      },
      {
        accessorKey: "name",
        header: "Adset Name",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 150,
      },
      {
        accessorKey: "v_campaign_name",
        header: "Voluum Campaign Name",
        cell: ({ getValue, row }) => {
          const realValue = getValue<string>();
          const adsetName = String(row.getValue("name"));
          const costUpdateStatus = String(row.getValue("cost_update_status"));

          if (!realValue) {
            const vCampStatus = String(row.getValue("v_campaign_status")) as
              | "Voluum server error"
              | "Archived"
              | "Invalid adset name"
              | "Everything is OK!";
            if (vCampStatus == "Archived") {
              return <Badge variant={"secondary"}>{vCampStatus}</Badge>;
            }

            if (
              vCampStatus == "Voluum server error" ||
              vCampStatus == "Invalid adset name"
            ) {
              return adsetName.length > 0 ? (
                <Badge variant={"destructive"}>{vCampStatus}</Badge>
              ) : (
                ""
              );
            }
            return vCampStatus ? (
              <Badge className="bg-green-500">{vCampStatus}</Badge>
            ) : (
              ""
            );
          }
          return (
            <div className="flex flex-col">
              <div className="whitespace-normal">{realValue}</div>
              {costUpdateStatus && (
                // <div className="text-muted-foreground whitespace-normal">
                //   {costUpdateStatus}
                // </div>
                <Badge className="bg-green-500 mt-1">{costUpdateStatus}</Badge>
              )}
            </div>
          );
        },
        minSize: 350,
      },
      {
        accessorKey: "v_campaign_status",
        header: "Voluum Campaign Status",
        minSize: 150,
      },
      {
        accessorKey: "account_status",
        header: "Account Status",
        size: 80,
      },
      {
        accessorKey: "disable_reason",
        header: "Disable Reason",
        size: 80,
      },
      {
        accessorKey: "effective_status",
        header: "Delivery",
        cell: ({ row, getValue }) => {
          const accountStatus = String(row.getValue("account_status"));
          const disableReason = String(row.getValue("disable_reason"));
          const filteredReason =
            disableReason.toLocaleLowerCase() !== "none" ? disableReason : "";
          const effectStatus = getValue<string>();
          if (accountStatus == "ACTIVE" && effectStatus) {
            return <div>{effectStatus}</div>;
          } else if (!filteredReason && !effectStatus) {
            return <div>{accountStatus}</div>;
          }
          return (
            <div className="whitespace-normal">
              <div>{accountStatus}</div>
              <div className="text-sm text-muted-foreground">
                <span className="lowercase">{filteredReason}</span>
              </div>
            </div>
          );
        },
        minSize: 150,
      },
      {
        accessorKey: "targeting_countries",
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
        accessorKey: "account_currency",
        header: "Currency",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();
          if (!cellValue.length) return null;
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        size: 50,
      },
      {
        accessorKey: "daily_budget",
        header: "Daily Budget",
        cell: ({ getValue }) => {
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
        cell: ({ getValue }) => {
          const realValue = getValue<any>();
          if (realValue === null || realValue === "") {
            return "";
          }

          return realValue >= 0 ? `$${realValue.toLocaleString()}` : "";
        },
        size: 80,
      },
      {
        accessorKey: "lead",
        header: "FB Lead",
        size: 80,
      },
      {
        accessorKey: "purchase",
        header: "FB FTD",
        size: 80,
      },
      {
        accessorKey: "v_campaign_id",
        header: "Voluum Campaign Id",
        size: 80,
      },
      {
        accessorKey: "v_lead",
        header: "Voluum Lead",
        size: 80,
      },
      {
        accessorKey: "v_ftd",
        header: "Voluum FTD",
        size: 80,
      },
      {
        accessorKey: "v_cpl",
        header: "CPL",
        size: 80,
      },
      {
        accessorKey: "v_cpa",
        header: "CPA",
        size: 80,
      },
      {
        accessorKey: "v_cv",
        header: "CV",
        size: 80,
      },
      {
        accessorKey: "cpm",
        header: "CPM",
        size: 80,
      },
      {
        accessorKey: "cost_per_inline_link_click",
        header: "CPC",
        size: 80,
      },
      {
        accessorKey: "inline_link_click_ctr",
        header: "CTR",
        size: 80,
      },
      {
        accessorKey: "link_click",
        header: "Link Click",
        size: 80,
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        size: 80,
      },
      {
        accessorKey: "impressions",
        header: "Impressions",
        size: 80,
      },
      {
        accessorKey: "reach",
        header: "Reach",
        size: 80,
      },
      {
        accessorKey: "cost_update_status",
        header: "Cost Update Status",
        size: 80,
      },
    ],
    []
  );

  return adColumns;
}
