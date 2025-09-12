"use client";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { AdCheckerSidebar } from "./AdCheckerSidebar";
import { AdCheckerTable } from "./table/AdCheckerTable";
import { startTransition, useEffect, useState } from "react";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/FacebookAdsManagerClientService";
import { toast } from "sonner";
import { AdCheckerDialog } from "./dialog/AdCheckerDialog";

type Props = {
  searchParams: { page: number; limit: number } & GetAllFbAccountsProps;
  isSuperOrAdmin: boolean;
};

export type ProfileMarketingApiAccessToken = {
  profile: string;
  accessToken: string;
};

export type AdData = {
  id: string | number;
  profile: string;
  ad_account: string;
  account_status: string;
  disable_reason: string;
  campaign_name: string;
  daily_budget: number;
  domain_name: any;
  links: Record<string, any>;
  targeting_geo: string[];
  spend: number;
  ad_status: Record<string, any>;
};

export type AdCreatives = {
  image: string;
  title: string;
  message: string;
  url: string;
};

export function AdCheckerContainer({ searchParams, isSuperOrAdmin }: Props) {
  const fbAdsManagerService = new FacebookAdsManagerClientService();

  const showToast = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const [isActionDisabled, setIsActionDisabled] = useState(false);
  const [validatedProfiles, setValidatedProfiles] = useState<
    ProfileMarketingApiAccessToken[]
  >([]);
  const [tableData, setTableData] = useState<AdData[]>([]);
  const [adCreativeData, setAdCreativeData] = useState<AdCreatives[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) {
    } else {
    }
  }, [isDialogOpen]);

  const handleDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      startTransition(() => setAdCreativeData([]));
    } else {
      setAdCreativeData([]);
    }
  };

  const handleSetValidatedProfiles = (
    data: ProfileMarketingApiAccessToken[]
  ) => {
    setValidatedProfiles(data);
  };

  const handleSubmitRequest = async () => {
    setTableData([]);
    for (const profile of validatedProfiles) {
      if (profile.accessToken == null || profile.accessToken == "") continue;

      const { data } = await fbAdsManagerService.adChecker({
        access_token: profile.accessToken,
      });

      const adData: AdData[] = data.map((ad) => {
        const links: AdCreatives[] =
          ad?.adcreatives?.map((creative: Record<string, any>) => ({
            image: creative.image_url,
            title: creative.title,
            message: creative.message,
            url: creative.call_to_action?.value?.link ?? "",
          })) ?? [];

        return {
          id: Number(ad.id) || 0,
          profile: profile.profile,
          ad_account: ad.ad_account_name || "",
          account_status: ad.account_status,
          disable_reason: ad.disable_reason,
          campaign_name: ad.name || "",
          daily_budget: Number(ad.daily_budget || 0),
          domain_name: ad.domain || [],
          spend: ad.spend || 0,
          links,
          ad_status: ad.ad_status,
          targeting_geo: ad.targeting_countries || [],
        };
      });

      const sortedAdData: any = adData.sort(
        (a, b) => b.ad_status.code - a.ad_status.code
      );

      setTableData((prevState) => [...prevState, ...sortedAdData]);
    }
    setIsActionDisabled(false);
  };

  const handleSubmit = async () => {
    setIsActionDisabled(true);
    toast.promise(handleSubmitRequest, {
      loading: "Processing profile...",
      position: "bottom-left",
      success: () => "Profiles has been successfully loaded.",
      error: "Error",
    });
  };

  const handleViewCreatives = (adCreatives: AdCreatives[]) => {
    handleDialogOpen(true);
    setAdCreativeData(adCreatives);
  };

  return (
    <div className="min-h-[calc(100dvh-7rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Ad Checker</div>
        <p className="text-sm">
          Easily verify your ad domain for accuracy and trustworthiness.
        </p>
      </div>

      <AdCheckerDialog
        adCreatives={adCreativeData}
        open={isDialogOpen}
        handleOpen={handleDialogOpen}
      />
      <div className="flex gap-4 min-h-[calc(100dvh-12rem)] mt-4 pr-4">
        <AdCheckerSidebar
          isActionDisabled={isActionDisabled}
          onSubmit={handleSubmit}
          onSetValidatedProfiles={handleSetValidatedProfiles}
          validatedProfiles={validatedProfiles}
        />
        <AdCheckerTable
          tableData={tableData}
          onViewCreatives={handleViewCreatives}
        />
      </div>
    </div>
  );
}
