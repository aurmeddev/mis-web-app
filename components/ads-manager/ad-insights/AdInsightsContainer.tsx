"use client";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { AdInsightsTable } from "./table/AdInsightsTable";
import { useState } from "react";
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
  isSuperOrAdmin: boolean;
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
  isSuperOrAdmin,
}: Props) {
  const dateFromSearchParam = searchParams.date_from;
  const dateToSearchParam = searchParams.date_to;
  const fbAdsManagerService = new FacebookAdsManagerClientService();
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
    if (filterObjValues.length > 0 && isFilterShown) {
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
          onSetDateRange={handleOnSetDateRange}
          isActionDisabled={isActionDisabled}
          isFilterShown={isFilterShown}
          onCheckedChange={handleCheckedChange}
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
