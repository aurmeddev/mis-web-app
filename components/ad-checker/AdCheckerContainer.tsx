"use client";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { AdCheckerSidebar } from "./AdCheckerSidebar";
import { AdCheckerTable } from "./table/AdCheckerTable";
import { startTransition, useEffect, useState } from "react";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/FacebookAdsManagerClientService";
import { toast } from "sonner";
import { AdCreativesDialog } from "./dialog/AdCreativesDialog";
import { AdCheckerProgressDialog } from "./dialog/AdCheckerProgressDialog";

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
  ad_checker_summary: Record<string, any>;
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
  const [isAdCheckerProgressDialogOpen, setIsAdCheckerProgressDialogOpen] =
    useState(false);
  const [adCheckerProgress, setAdCheckerProgress] = useState(0);
  const [profile, setProfile] = useState<string>("");

  useEffect(() => {
    if (!isDialogOpen) {
    } else {
    }
  }, [isDialogOpen]);

  const handleAdCreativesDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      startTransition(() => setAdCreativeData([]));
    } else {
      setAdCreativeData([]);
    }
  };

  const handleAdCheckerProgressDialogOpen = (open: boolean) => {
    setIsDialogOpen(open);
  };

  const handleSetValidatedProfiles = (
    data: ProfileMarketingApiAccessToken[]
  ) => {
    setValidatedProfiles(data);
  };

  const handleSubmitRequest = async () => {
    setTableData([]);
    setIsAdCheckerProgressDialogOpen(true);
    setAdCheckerProgress(0);
    for (const profile of validatedProfiles) {
      if (profile.accessToken == null || profile.accessToken == "") continue;

      // setAdCheckerProgressData((prevState: any) => ({ profile: profile.profile, progress: }))
      setProfile(profile.profile);
      const { data } = await fbAdsManagerService.adChecker({
        access_token: profile.accessToken.trim(),
      });

      const divisor = (100 / validatedProfiles.length).toFixed();
      setAdCheckerProgress((prev) => {
        const currentProgress = (prev += Number(divisor));
        return currentProgress >= 99 ? 100 : currentProgress;
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
          ad_checker_summary: ad.ad_checker_summary,
          targeting_geo: ad.targeting_countries || [],
        };
      });

      const sortedAdData: any = adData.sort(
        (a, b) => b.ad_checker_summary.code - a.ad_checker_summary.code
      );

      setTableData((prevState) => [...prevState, ...sortedAdData]);
    }
    setIsActionDisabled(false);
    setIsAdCheckerProgressDialogOpen(false);
  };

  const handleSubmit = async () => {
    setIsActionDisabled(true);
    handleSubmitRequest();
  };

  const handleViewCreatives = (adCreatives: AdCreatives[]) => {
    handleAdCreativesDialogOpen(true);
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

      <AdCreativesDialog
        adCreatives={adCreativeData}
        open={isDialogOpen}
        handleOpen={handleAdCreativesDialogOpen}
      />

      <AdCheckerProgressDialog
        open={isAdCheckerProgressDialogOpen}
        handleOpen={handleAdCheckerProgressDialogOpen}
        profile={profile}
        profilesLength={validatedProfiles.length}
        progress={adCheckerProgress}
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
