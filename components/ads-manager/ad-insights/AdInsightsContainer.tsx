"use client";
import { AdInsightsTable } from "./table/AdInsightsTable";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerClientService";
import { AdCheckerProgressDialog } from "./dialog/AdInsightsProgressDialog";
import { AdInsightsSidebar } from "./AdInsightsSidebar";
import { DateRange } from "react-day-picker";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { format, formatDate } from "date-fns";
import { datePresets } from "@/components/shared/datepicker/DatePresetSelect";
import { ProfileMarketingApiAccessToken } from "../ad-checker/AdCheckerContainer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";
import { NetworkRequestUtils } from "@/lib/utils/network-request/NetworkRequestUtils";
import {
  AdInsightsContainerProps,
  AdInsightsData,
  AdInsightsFilters,
  ApiFiltering,
} from "./AdInsights.types";
import { VoluumApiClientService } from "@/lib/features/ads-manager/voluum/VoluumApiClientService";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_PROGRESS = {
  actionType: "",
  count: 0,
  label: "",
  length: 0,
  itemsLabel: "",
};

export function AdInsightsContainer({
  brands,
  geos,
  mediaBuyers,
  searchParams,
}: AdInsightsContainerProps) {
  const dateFromSearchParam = searchParams.date_from;
  const dateToSearchParam = searchParams.date_to;
  const fbAdsManagerService = new FacebookAdsManagerClientService();
  const jsonCsvManager = new Json2CsvManager();
  const dateUtil = new DatetimeUtils();
  const networkRequestUtils = new NetworkRequestUtils();
  const voluumApiService = new VoluumApiClientService();

  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [validatedProfiles, setValidatedProfiles] = useState<
    ProfileMarketingApiAccessToken[]
  >([]);
  const [tableData, setTableData] = useState<AdInsightsData[]>([]);
  const [isAdInsightsProgressDialogOpen, setIsAdInsightsProgressDialogOpen] =
    useState(false);
  const [adInsightsProgress, setAdInsightsProgress] =
    useState(INITIAL_PROGRESS);
  const [isExportReady, setIsExportReady] = useState(false);
  const [isUpdatingCost, setIsUpdatingCost] = useState(false);
  const [filters, setFilters] = useState<AdInsightsFilters>({
    brand: "",
    budgetOptimization: "",
    geo: "",
    mediaBuyer: "",
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const isDateRangeValid =
      dateUtil.isValidYMDFormat(dateFromSearchParam) &&
      dateUtil.isValidYMDFormat(dateToSearchParam);
    const date = {
      from: new Date(dateFromSearchParam),
      to: new Date(dateToSearchParam),
    };
    return isDateRangeValid ? date : datePresets["yesterday"];
  });

  const handleAdCheckerProgressDialogOpen = (open: boolean) => {};

  const handleSetValidatedProfiles = (
    data: ProfileMarketingApiAccessToken[],
    isRemove: boolean
  ) => {
    if (isRemove) {
      setValidatedProfiles(data);
    } else {
      setValidatedProfiles((prevState) => {
        const merged = [...prevState, ...data];
        const map = new Map(merged.map((item) => [item.profile, item]));
        return Array.from(map.values());
      });
    }
  };

  const handleSubmitRequest = async () => {
    setIsAdInsightsProgressDialogOpen(true);
    setIsExportReady(false);
    setAdInsightsProgress((prevState) => ({
      ...prevState,
      count: 0,
      length: validatedProfiles.length,
      actionType: "Retrieving",
      itemsLabel: "profiles.",
    }));

    const date_from = format(String(dateRange?.from), "yyyy-MM-dd");
    const date_to = format(String(dateRange?.to), "yyyy-MM-dd");

    const optionalFilters: ApiFiltering[] = [];
    const filterObjValues = Object.values(filters).filter(Boolean);
    if (filterObjValues.length > 0) {
      filterObjValues.forEach((value) => {
        optionalFilters.push({
          field: "adset.name",
          operator: "CONTAIN",
          value: value,
        });
      });
    }

    const tasks = validatedProfiles.map((profile) => async () => {
      const invalidProfiles: AdInsightsData[] = [];
      if (!profile.accessToken || !profile.canRequest) {
        invalidProfiles.push({
          id: 0,
          profile: profile.profile,
          ad_account_name: "",
          ad_insights_summary: { code: 400, message: profile.status },
          name: "",
          v_campaign_id: "",
          v_campaign_name: "",
          v_campaign_status: "",
          account_status: "",
          disable_reason: "",
          effective_status: "",
          targeting_countries: [],
          account_currency: "",
          daily_budget: 0,
          spend: 0,
          lead: 0,
          purchase: "",
          v_lead: 0,
          v_ftd: 0,
          v_cpl: 0,
          v_cpa: 0,
          v_cv: 0,
          cpm: 0,
          cost_per_inline_link_click: 0,
          inline_link_click_ctr: 0,
          link_click: 0,
          frequency: 0,
          impressions: 0,
          reach: 0,
          cost_update_status: "",
        });
      }

      let adInsightsData: AdInsightsData[] = [];
      if (profile.canRequest) {
        setAdInsightsProgress((prevState) => ({
          ...prevState,
          label: profile.profile,
        }));

        const { data } = await fbAdsManagerService.adInsights({
          access_token: profile.accessToken.trim(),
          date_from,
          date_to,
          filtering: optionalFilters,
          isVoluumIncluded: true,
        });

        const divisor = (100 / validatedProfiles.length).toFixed();
        setAdInsightsProgress((prevState) => {
          const currentProgress = (prevState.count += Number(divisor));
          return {
            ...prevState,
            label: profile.profile,
            count: currentProgress >= 99 ? 100 : currentProgress,
          };
        });

        adInsightsData = data.map((ad: AdInsightsData) => {
          return {
            id: Number(ad.id) || 0,
            profile: profile.profile || "",
            ad_account_name: ad.ad_account_name || "",
            ad_insights_summary: ad.ad_insights_summary || {},

            name: ad.name || "",
            v_campaign_id: ad.v_campaign_id || "",
            v_campaign_name: ad.v_campaign_name || "",
            v_campaign_status: ad.v_campaign_status || "",

            account_status: ad.account_status || "",
            disable_reason: ad.disable_reason || "",
            effective_status: ad.effective_status || "",

            targeting_countries: ad.targeting_countries || "",
            account_currency: ad.account_currency || "",
            daily_budget: Number(ad.daily_budget) || 0,
            spend: Number(ad.spend) || 0,

            lead: Number(ad.lead) || 0,
            purchase: ad.purchase || "",

            v_lead: Number(ad.v_lead) || 0,
            v_ftd: Number(ad.v_ftd) || 0,
            v_cpl: Number(ad.v_cpl) || 0,
            v_cpa: Number(ad.v_cpa) || 0,
            v_cv: Number(ad.v_cv) || 0,

            cpm: Number(ad.cpm) || 0,
            cost_per_inline_link_click:
              Number(ad.cost_per_inline_link_click) || 0,
            inline_link_click_ctr: Number(ad.inline_link_click_ctr) || 0,
            link_click: Number(ad.link_click) || 0,
            frequency: Number(ad.frequency) || 0,
            impressions: Number(ad.impressions) || 0,
            reach: Number(ad.reach) || 0,
            cost_update_status: "",
          } as AdInsightsData;
        });
      } else {
        const divisor = (100 / validatedProfiles.length).toFixed();
        setAdInsightsProgress((prevState) => {
          const currentProgress = (prevState.count += Number(divisor));
          return {
            ...prevState,
            count: currentProgress >= 99 ? 100 : currentProgress,
          };
        });
      }

      const combinedAdData = [...invalidProfiles, ...adInsightsData];
      setTableData((prevState) => [...prevState, ...combinedAdData]);
    });

    // run in batches set to 1 temp
    await networkRequestUtils.batchAllSettled(tasks, 1);
    setIsExportReady(true);
    setIsActionDisabled(false);
    setIsAdInsightsProgressDialogOpen(false);
    setAdInsightsProgress(INITIAL_PROGRESS);
  };

  const handleSubmit = async () => {
    if (validatedProfiles.length === 0) {
      toast.info("Please enter profile(s)!");
      return;
    }
    setIsActionDisabled(true);
    setTableData([]);
    handleSubmitRequest();
  };

  const handleOnSetDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleValueChange = (
    value: string,
    type: "brand" | "budgetOptimization" | "geo" | "mediaBuyer"
  ) => {
    setFilters((prevState) => ({ ...prevState, [type]: value }));
  };

  const handleExportAdInsights = async () => {
    const allCamps = tableData
      .filter(
        (d) =>
          d.ad_insights_summary.code === 200 ||
          d.ad_insights_summary.code === 404
      )
      .map((data: AdInsightsData) => {
        const {
          ad_account_name,
          account_status,
          ad_insights_summary,
          cost_per_inline_link_click,
          cpm,
          daily_budget,
          disable_reason,
          effective_status,
          frequency,
          impressions,
          inline_link_click_ctr,
          lead,
          link_click,
          name,
          profile,
          purchase,
          reach,
          spend,
          targeting_countries,
          account_currency,
          v_campaign_name,
          v_campaign_status,
          v_lead,
          v_ftd,
          v_cpl,
          v_cpa,
          v_cv,
          cost_update_status,
        } = data;

        const campaignName = v_campaign_name
          ? v_campaign_name
          : v_campaign_status;
        const delivery =
          account_status == "ACTIVE" ? effective_status : account_status;
        const adInsightsSummary = ad_insights_summary
          ? ad_insights_summary.message.join(". ")
          : "";

        return {
          profile,
          ad_account: ad_account_name,
          ad_insights_summary: adInsightsSummary,
          adset_name: name,
          voluum_campaign_name: campaignName,
          delivery: delivery ? delivery : account_status,
          disable_reason,
          targeting_geo:
            targeting_countries?.length > 0
              ? targeting_countries.join(", ")
              : "",
          account_currency,
          daily_budget,
          spend,
          fb_lead: lead,
          fb_ftd: purchase,
          voluum_lead: v_lead,
          voluum_ftd: v_ftd,
          cpl: v_cpl,
          cpa: v_cpa,
          cv: v_cv,
          cpm: cpm,
          cpc: cost_per_inline_link_click,
          ctr: inline_link_click_ctr,
          link_click,
          frequency,
          impressions,
          reach,
          cost_update_status,
        };
      });

    const flaggedCamps = tableData
      .filter(
        (data) =>
          data.ad_insights_summary.code === 400 ||
          data.ad_insights_summary.code === 500
      )
      .map((data: AdInsightsData) => {
        const { profile, ad_insights_summary } = data;
        const adInsightsSummary = ad_insights_summary
          ? ad_insights_summary.message.join(". ")
          : "";
        return {
          profile,
          ad_insights_summary: adInsightsSummary,
        };
      });
    const downloadToCsv = [allCamps, flaggedCamps];
    downloadToCsv.map(async (download, idx) => {
      try {
        const csv = await jsonCsvManager.convertJsonToCSV(download);

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const todayDate = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        const csvName =
          idx == 0 ? "Performance Analysis Report Data" : "Flagged Profiles";
        const a = document.createElement("a");
        a.href = url;
        a.download = `${csvName}-${todayDate.replaceAll("/", "-")}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error converting JSON to CSV:", err);
      }
    });
  };

  const handleUpdateCost = async () => {
    setIsAdInsightsProgressDialogOpen(true);
    setIsUpdatingCost(true);
    // const sampleData = [
    //   {
    //     id: 0,
    //     profile: "PH-AP OXY 05956",
    //     ad_account_name: "Cheerful News",
    //     ad_insights_summary: {
    //       code: 404,
    //       message: ["No traffic data"],
    //     },
    //     name: "IBC22MYC198JC0007",
    //     v_campaign_id: "865879a1-6c70-49b2-ae88-837ae0d7182d",
    //     v_campaign_name:
    //       "FB S2S CMS - Malaysia - IBC22MYC198JC0007 - MYC IMG170 Ex FIBCCA FS198",
    //     v_campaign_status: "Everything is OK!",
    //     account_status: "DISABLED",
    //     disable_reason: "ADS_INTEGRITY_POLICY",
    //     effective_status: "ACTIVE",
    //     targeting_countries: "",
    //     daily_budget: 1,
    //     spend: 1,
    //     lead: 0,
    //     purchase: "",
    //     v_lead: 0,
    //     v_ftd: 0,
    //     v_cpl: 0,
    //     v_cpa: 0,
    //     v_cv: 0,
    //     cpm: 0,
    //     cost_per_inline_link_click: 0,
    //     inline_link_click_ctr: 0,
    //     link_click: 0,
    //     frequency: 0,
    //     impressions: 0,
    //     reach: 0,
    //     cost_update_status: "",
    //   },
    // ];
    const filteredTableData = tableData.filter(
      (t) =>
        t.v_campaign_status == "Everything is OK!" &&
        t.v_campaign_id &&
        t.spend > 0 &&
        t.cost_update_status !== "COST_UPDATED" &&
        t.cost_update_status !== "NO_VISITS_PERIOD" &&
        t.cost_update_status !== "TIME_RANGE_EXCEED_LAST_HOUR"
    );

    const formattedDateFrom = format(dateRange?.from || "", "yyyy-MM-dd");
    const formattedDateTo = format(dateRange?.to || "", "yyyy-MM-dd");
    const costUpdateDataLength = filteredTableData.length;
    const divisor = (100 / costUpdateDataLength).toFixed();
    for (let i = 0; i < costUpdateDataLength; i++) {
      const { name, spend, v_campaign_id } = filteredTableData[i];
      if (spend > 0) {
        setAdInsightsProgress((prevState) => ({
          ...prevState,
          actionType: "Updating Cost",
          label: name,
          length: costUpdateDataLength,
          itemsLabel: "campaigns.",
        }));

        const { data } = await voluumApiService.updateCost({
          date_from: formattedDateFrom,
          date_to: formattedDateTo,
          spend,
          v_campaign_id,
        });

        setAdInsightsProgress((prevState) => {
          const currentProgress = (prevState.count += Number(divisor));
          return {
            ...prevState,
            count: currentProgress >= 99 ? 100 : currentProgress,
            label: name,
          };
        });

        setTableData((prevState) =>
          prevState.map((item) => {
            const output =
              item.v_campaign_id == v_campaign_id
                ? { ...item, cost_update_status: data[0].status }
                : item;
            return output;
          })
        );
      }
    }
    setIsUpdatingCost(false);
    setIsAdInsightsProgressDialogOpen(false);
    setAdInsightsProgress(INITIAL_PROGRESS);
  };

  return (
    <div className="min-h-[calc(100dvh-7rem)] p-6 pr-0">
      <div className="flex justify-between">
        <div>
          <div className="text-xl">Ad Insights</div>
          <p className="text-sm">
            Get real-time performance metrics from your campaigns.
          </p>
        </div>

        <Button size={"sm"} className="hidden mr-4">
          Refresh data
        </Button>
        <div className="items-end flex justify-end mr-4">
          <Button
            className={cn("cursor-pointer", !isExportReady && "hidden")}
            disabled={isUpdatingCost || !isExportReady}
            onClick={handleUpdateCost}
            size={"sm"}
          >
            <LocateFixed /> {isUpdatingCost ? "Updating Cost" : "Update Cost"}
          </Button>
        </div>
      </div>

      <AdCheckerProgressDialog
        open={isAdInsightsProgressDialogOpen}
        handleOpen={handleAdCheckerProgressDialogOpen}
        itemsLength={validatedProfiles.length}
        progress={adInsightsProgress.count}
        texts={{
          actionType: adInsightsProgress.actionType,
          currentItemTitle: adInsightsProgress.label,
          itemsLabel: adInsightsProgress.itemsLabel,
        }}
      />

      <div className="flex gap-4 min-h-[calc(100dvh-12rem)] mt-4 pr-4">
        <AdInsightsSidebar
          brands={brands}
          geos={geos}
          mediaBuyers={mediaBuyers}
          dateRange={dateRange}
          filters={filters}
          onSetDateRange={handleOnSetDateRange}
          isExportReady={isExportReady}
          isActionDisabled={isActionDisabled}
          // isFilterShown={isFilterShown}
          onExportData={handleExportAdInsights}
          // onCheckedChange={handleCheckedChange}
          onValueChange={handleValueChange}
          onSubmit={handleSubmit}
          onSetValidatedProfiles={handleSetValidatedProfiles}
          validatedProfiles={validatedProfiles}
        />
        <AdInsightsTable tableData={tableData} />
      </div>
    </div>
  );
}
