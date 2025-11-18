"use client";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { AdInsightsTable } from "./table/AdInsightsTable";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerClientService";
import { AdCheckerProgressDialog } from "./dialog/AdInsightsProgressDialog";
import { AdInsightsSidebar } from "./AdInsightsSidebar";
import { DateRange } from "react-day-picker";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { format } from "date-fns";
import { datePresets } from "@/components/shared/datepicker/DatePresetSelect";
import { SelectOptions } from "@/components/shared/select/type";
import { ProfileMarketingApiAccessToken } from "../ad-checker/AdCheckerContainer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckedState } from "@radix-ui/react-checkbox";
import { useState } from "react";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";

type Props = {
  brands: SelectOptions[];
  geos: SelectOptions[];
  mediaBuyers: SelectOptions[];
  searchParams: {
    page: number;
    limit: number;
    date_from: string;
    date_to: string;
  } & GetAllFbAccountsProps;
};

export type AdInsightsData = {
  id: number;
  profile: string; // Profile
  ad_account_name: string; // Account Name
  ad_insights_summary: Record<string, unknown>; // Ad Insights Summary
  name: string; // Adset Name
  v_campaign_name: string; // Voluum Campaign Name || if null
  v_campaign_status: string; // Voluum Campaign Name || display this
  account_status: string; // Delivery
  disable_reason: string; // Delivery
  effective_status: string; // Delivery
  targeting_countries: string; // Targeting Geo
  daily_budget: number; // Daily Budget
  spend: number; // Spend
  lead: number; // FB Lead
  purchase: string; // FB FTD
  v_lead: number; // Voluum Lead
  v_ftd: number; // Voluum FTD
  v_cpl: number; // CPL
  v_cpa: number; // CPA
  v_cv: number; // CV
  cpm: number; // CPM
  cost_per_inline_link_click: number; // CPC
  inline_link_click_ctr: number; // CTR
  link_click: number; // Link Click
  frequency: number; // Frequency
  impressions: number; // Impressions
  reach: number; // Reach
};

export type AdInsightsFilters = {
  brand: string;
  budgetOptimization: string;
  geo: string;
  mediaBuyer: string;
};

type ApiFiltering = { field: string; operator: "CONTAIN"; value: string };

export function AdInsightsContainer({
  brands,
  geos,
  mediaBuyers,
  searchParams,
}: Props) {
  const dateFromSearchParam = searchParams.date_from;
  const dateToSearchParam = searchParams.date_to;
  const fbAdsManagerService = new FacebookAdsManagerClientService();
  const jsonCsvManager = new Json2CsvManager();
  const dateUtil = new DatetimeUtils();

  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [validatedProfiles, setValidatedProfiles] = useState<
    ProfileMarketingApiAccessToken[]
  >([]);
  const [tableData, setTableData] = useState<AdInsightsData[]>([]);
  const [isAdInsightsProgressDialogOpen, setIsAdInsightsProgressDialogOpen] =
    useState(false);
  const [adCheckerProgress, setAdCheckerProgress] = useState(0);
  const [profile, setProfile] = useState<string>("");
  const [isFilterShown, setIsFilterShown] = useState(false);
  const [isExportReady, setIsExportReady] = useState(false);
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
    setAdCheckerProgress(0);

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

    for (const profile of validatedProfiles) {
      const invalidProfiles: AdInsightsData[] = [];
      if (!profile.accessToken || !profile.canRequest) {
        invalidProfiles.push({
          id: 0,
          profile: profile.profile,
          ad_account_name: "",
          ad_insights_summary: { code: 400, message: profile.status },
          name: "",
          v_campaign_name: "",
          v_campaign_status: "",
          account_status: "",
          disable_reason: "",
          effective_status: "",
          targeting_countries: "",
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
        });
      }

      let adInsightsData: AdInsightsData[] = [];
      if (profile.canRequest) {
        setProfile(profile.profile);
        const { data } = await fbAdsManagerService.adInsights({
          access_token: profile.accessToken.trim(),
          date_from,
          date_to,
          filtering: optionalFilters,
          isVoluumIncluded: true,
        });

        // IBCMYCSL196_IBC22_MY_ABO_JIACO_a9f135ef-069e-461f-bb86-cea7837b299b
        const divisor = (100 / validatedProfiles.length).toFixed();
        setAdCheckerProgress((prev) => {
          const currentProgress = (prev += Number(divisor));
          return currentProgress >= 99 ? 100 : currentProgress;
        });

        adInsightsData = data.map((ad: AdInsightsData) => {
          return {
            id: Number(ad.id) || 0,
            profile: profile.profile || "",
            ad_account_name: ad.ad_account_name || "",
            ad_insights_summary: ad.ad_insights_summary || {},

            name: ad.name || "",
            v_campaign_name: ad.v_campaign_name || "",
            v_campaign_status: ad.v_campaign_status || "",

            account_status: ad.account_status || "",
            disable_reason: ad.disable_reason || "",
            effective_status: ad.effective_status || "",

            targeting_countries: ad.targeting_countries || "",
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
          } as AdInsightsData;
        });
      } else {
        const divisor = (100 / validatedProfiles.length).toFixed();
        setAdCheckerProgress((prev) => {
          const currentProgress = (prev += Number(divisor));
          return currentProgress >= 99 ? 100 : currentProgress;
        });
      }

      const combinedAdData = [...invalidProfiles, ...adInsightsData];
      // const sortedAdData: any = combinedAdData.sort(
      //   (a, b) => b.ad_checker_summary.code - a.ad_checker_summary.code
      // );

      setTableData((prevState) => [...prevState, ...combinedAdData]);
    }
    setIsExportReady(true);
    setIsActionDisabled(false);
    setIsAdInsightsProgressDialogOpen(false);
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

  const handleCheckedChange = (checked: CheckedState) => {
    setIsFilterShown(checked ? true : false);
  };

  const handleExportAdInsights = async () => {
    const plainData = tableData.map((data: any) => {
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
        v_campaign_name,
        v_campaign_status,
        v_lead,
        v_ftd,
        v_cpl,
        v_cpa,
        v_cv,
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
        delivery: delivery ? delivery : "",
        disable_reason,
        targeting_geo:
          targeting_countries?.length > 0 ? targeting_countries.join(", ") : "",
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
      };
    });

    try {
      const csv = await jsonCsvManager.convertJsonToCSV(plainData);

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const todayDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-data-${profile}-${todayDate.replaceAll(
        "/",
        "-"
      )}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error converting JSON to CSV:", err);
    }
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
      </div>

      <AdCheckerProgressDialog
        open={isAdInsightsProgressDialogOpen}
        handleOpen={handleAdCheckerProgressDialogOpen}
        profile={profile}
        profilesLength={validatedProfiles.length}
        progress={adCheckerProgress}
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
          isFilterShown={isFilterShown}
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
