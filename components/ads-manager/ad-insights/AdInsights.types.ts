import { SelectOptions } from "@/components/shared/select/type";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { DateRange } from "react-day-picker";
import { ProfileMarketingApiAccessToken } from "../ad-checker/AdCheckerContainer";

type AdInsightsContainerProps = {
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

type AdInsightsData = {
  id: number;
  profile: string; // Profile
  ad_account_name: string; // Account Name
  ad_insights_summary: Record<string, unknown>; // Ad Insights Summary
  account_currency: string;
  name: string; // Adset Name
  v_campaign_id: string; // Voluum Campaign ID
  v_campaign_name: string; // Voluum Campaign Name
  v_campaign_status: string; // Voluum Campaign Status
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
  cost_update_status: string;
};

type AdInsightsFilters = {
  brand: string;
  budgetOptimization: string;
  geo: string;
  mediaBuyer: string;
};

type ApiFiltering = { field: string; operator: "CONTAIN"; value: string };

type AdInsightsSidebarProps = {
  brands: SelectOptions[];
  geos: SelectOptions[];
  mediaBuyers: SelectOptions[];
  dateRange: DateRange | undefined;
  filters: AdInsightsFilters;
  isExportReady: boolean;
  isActionDisabled: boolean;
  //   isFilterShown: boolean;
  onExportData: () => void;
  // onCheckedChange: (checked: CheckedState) => void;
  onValueChange: (
    value: string,
    type: "brand" | "budgetOptimization" | "geo" | "mediaBuyer"
  ) => void;
  onSubmit: () => void;
  onSetDateRange: (range: DateRange) => void;
  onSetValidatedProfiles: (
    data: ProfileMarketingApiAccessToken[],
    isRemove: boolean
  ) => void;
  validatedProfiles: ProfileMarketingApiAccessToken[];
};

type AdCheckerProgressDialogProps = {
  open: boolean;
  handleOpen: (open: boolean) => void;
  profile: string;
  progress: number;
  profilesLength: number;
};

type AdInsightsTableProps = {
  tableData: AdInsightsData[];
};

export type {
  AdInsightsContainerProps,
  ApiFiltering,
  AdInsightsFilters,
  AdInsightsData,
  AdInsightsSidebarProps,
  AdCheckerProgressDialogProps,
  AdInsightsTableProps,
};
