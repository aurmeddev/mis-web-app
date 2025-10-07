import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { AdData, PauseStates, RefreshStates } from "../AdCheckerContainer";
import { AdCheckerAction } from "../action/AdCheckerAction";
import { ProfileHeader } from "./header/ProfileHeader";
import { DeliveryHeader } from "./header/DeliveryHeader";

type Props = {
  onPauseStatesChange: (isCountdownDone: boolean) => void;
  onViewCreatives: (adCreatives: any) => void;
  onRefresh: () => void;
  onPauseSusCamp: () => void;
  serverErrors: {
    hasAdCheckerSummaryFBServerError: boolean;
    hasUpdateCampDeliveryStatusError: boolean;
  };
  refreshStates: RefreshStates;
  pauseStates: PauseStates;
};

export function useAdColumns({
  pauseStates,
  refreshStates,
  onPauseStatesChange,
  onViewCreatives,
  onRefresh,
  onPauseSusCamp,
  serverErrors,
}: Props) {
  const profileHeader = useMemo(
    () => (
      <ProfileHeader
        hasAdCheckerSummaryFBServerError={
          serverErrors.hasAdCheckerSummaryFBServerError
        }
        onRefresh={onRefresh}
        refreshStates={refreshStates}
      />
    ),
    [serverErrors, onRefresh, refreshStates]
  );

  const adColumns: ColumnDef<AdData>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Identification",
        size: 80,
      },
      {
        accessorKey: "profile",
        header: () => profileHeader,
        minSize: 150,
      },
      {
        accessorKey: "ad_account",
        header: "Ad Account",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 150,
      },
      {
        accessorKey: "update_campaign_delivery_status",
        header: "Update Campaign Delivery Status",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>();
          return <div className="whitespace-normal">{cellValue}</div>;
        },
        minSize: 150,
      },
      {
        accessorKey: "ad_checker_summary",
        header: "Ad Checker Summary",
        cell: ({ getValue }) => {
          const cellValue = getValue<any>();

          if (!cellValue || !("code" in cellValue)) return "";
          const isInternalServerError = cellValue?.code === 500;
          const isAdCheckerSummaryOk = cellValue?.code === 200;
          const isAdCheckerSummaryNoAdset = cellValue?.code === 404;
          const isAdCheckerSummaryProfileIssue = cellValue?.code === 400;
          const totalMessageLength = cellValue.message.length - 1;
          return (
            <div className="whitespace-normal">
              <ul>
                {cellValue?.message.map(
                  (adCheckerSummary: any, idx: number) => (
                    <li key={idx}>
                      {isAdCheckerSummaryOk ? (
                        <Badge className="bg-green-500">
                          {adCheckerSummary}
                        </Badge>
                      ) : isAdCheckerSummaryNoAdset ? (
                        <Badge variant={"secondary"}>{adCheckerSummary}</Badge>
                      ) : isAdCheckerSummaryProfileIssue ? (
                        <Badge variant={"destructive"}>
                          {adCheckerSummary}
                        </Badge>
                      ) : (
                        <>• {adCheckerSummary} </>
                      )}
                      {isInternalServerError && idx == totalMessageLength && (
                        <Badge className="uppercase" variant={"destructive"}>
                          Suspicious
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
        accessorKey: "account_status",
        header: "Account Status",
        cell: ({ getValue }) => {
          const cellValue = getValue<string>();
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
        accessorKey: "effective_status",
        header: () => (
          <DeliveryHeader
            hasUpdateCampDeliveryStatusError={
              serverErrors.hasUpdateCampDeliveryStatusError
            }
            onPauseStatesChange={onPauseStatesChange}
            onPauseSusCamp={onPauseSusCamp}
            pauseStates={pauseStates}
          />
        ),
        cell: ({ row, getValue }) => {
          const accountStatus = String(row.getValue("account_status"));
          const disableReason = String(row.getValue("disable_reason"));
          const updateCampDeliveryStatus = String(
            row.getValue("update_campaign_delivery_status") || ""
          );
          const isFacebookServerError =
            updateCampDeliveryStatus == "Facebook server error";
          const filteredReason =
            disableReason.toLocaleLowerCase() !== "none" ? disableReason : "";
          const effectStatus = getValue<string>();

          if (!("effective_status" in row.original)) return "";
          if (accountStatus == "ACTIVE") {
            return (
              <div>
                {isFacebookServerError ? (
                  <div className="flex flex-col">
                    {effectStatus}
                    <Badge variant={"destructive"}>
                      Failed delivery status update
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {effectStatus}
                    {updateCampDeliveryStatus && (
                      <Badge className="bg-green-500">
                        {updateCampDeliveryStatus}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
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
          if (adCheckerSummary?.code == 404 || !adCheckerSummary) {
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
          const realValue = getValue<any>();
          if (realValue === null || realValue === "") {
            return "";
          }

          const adCheckerSummary: { code: number } =
            row.getValue("ad_checker_summary");
          if (adCheckerSummary?.code == 404 || !adCheckerSummary) {
            return "";
          }

          return realValue >= 0 ? `$${realValue.toLocaleString()}` : "";
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
                <div key={domain.name}>{domain.name}</div>
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
        cell: ({ getValue, row }) => {
          const adCreatives = getValue<Record<string, any>>();
          const spend = Number(row.getValue("spend"));

          if (adCreatives.length == 0) {
            if (spend > 0) {
              return (
                <div className="text-wrap text-xs text-center text-muted-foreground">
                  Unable to get Ad Creatives
                </div>
              );
            }
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
    [onViewCreatives, onRefresh, serverErrors]
  );

  return adColumns;
}
