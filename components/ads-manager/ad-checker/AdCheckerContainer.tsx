"use client";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { AdCheckerSidebar } from "./AdCheckerSidebar";
import { AdCheckerTable } from "./table/AdCheckerTable";
import { startTransition, useState } from "react";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerClientService";
import { AdCreativesDialog } from "./dialog/AdCreativesDialog";
import { AdCheckerProgressDialog } from "./dialog/AdCheckerProgressDialog";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";

type Props = {
  searchParams: { page: number; limit: number } & GetAllFbAccountsProps;
  isSuperOrAdmin: boolean;
};

export type ProfileMarketingApiAccessToken = {
  profile: string;
  accessToken: string;
  status: string[];
  canRequest: boolean;
};

export type AdData = {
  id: string | number;
  created_at?: string;
  profile: string;
  ad_account: string;
  effective_status: string;
  account_status: string;
  disable_reason: string;
  campaign_name: string;
  daily_budget: string | number;
  domain_name: any;
  links: AdLinks[];
  targeting_geo: string[];
  spend: string | number;
  ad_checker_summary: Record<string, any>;
};

type AdLinks = { image: string; message: string; title: string; url: string };

export type AdCreatives = {
  image: string;
  title: string;
  message: string;
  url: string;
};

export function AdCheckerContainer({ searchParams, isSuperOrAdmin }: Props) {
  const fbAdsManagerService = new FacebookAdsManagerClientService();
  const jsonCsvManager = new Json2CsvManager();
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
  const [isExportReady, setIsExportReady] = useState(false);

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

  const batchAllSettled = async (
    tasks: (() => Promise<any>)[],
    batchSize = 50
  ) => {
    const results: any[] = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize).map((fn) => fn());
      const settled = await Promise.allSettled(batch);
      results.push(...settled);
    }

    return results;
  };

  const handleSubmitRequest = async () => {
    setIsAdCheckerProgressDialogOpen(true);
    setAdCheckerProgress(0);

    const divisor = 100 / validatedProfiles.length;

    // wrap each profile’s work into a task function
    const tasks = validatedProfiles.map((profile) => async () => {
      const invalidProfiles: AdData[] = [];

      if (!profile.accessToken || !profile.canRequest) {
        invalidProfiles.push({
          id: 0,
          profile: profile.profile,
          ad_account: "",
          account_status: "",
          effective_status: "",
          disable_reason: "",
          campaign_name: "",
          daily_budget: "",
          domain_name: [],
          spend: "",
          links: [],
          ad_checker_summary: { code: 400, message: profile.status },
          targeting_geo: [],
        });

        setTableData((prev) => [...prev, ...invalidProfiles]);
        setAdCheckerProgress((prev) => Math.min(100, prev + divisor));
        return;
      }

      try {
        setProfile(profile.profile);

        const { data } = await fbAdsManagerService.adChecker({
          access_token: profile.accessToken.trim(),
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
            effective_status: ad.effective_status,
            account_status: ad.account_status,
            disable_reason: ad.disable_reason,
            campaign_name: ad.name || "",
            created_at: ad.created_at || "",
            daily_budget: ad.daily_budget,
            domain_name: ad.domain || [],
            spend: ad.spend || 0,
            links,
            ad_checker_summary: ad.ad_checker_summary,
            targeting_geo: ad.targeting_countries || [],
          };
        });

        const sortedAdData = adData.sort(
          (a, b) => b.ad_checker_summary?.code - a.ad_checker_summary?.code
        );

        setTableData((prev) => [...prev, ...sortedAdData]);
      } catch (error) {
        console.error("AdChecker error:", error);
      } finally {
        setAdCheckerProgress((prev) => Math.min(100, prev + divisor));
      }
    });

    // run in batches of 50
    await batchAllSettled(tasks, 50);

    setIsExportReady(true);
    setIsActionDisabled(false);
    setIsAdCheckerProgressDialogOpen(false);
  };

  // const handleSubmitRequest = async () => {
  //   setIsAdCheckerProgressDialogOpen(true);
  //   setAdCheckerProgress(0);

  //   const divisor = 100 / validatedProfiles.length;

  //   await Promise.allSettled(
  //     validatedProfiles.map(async (profile) => {
  //       const invalidProfiles: AdData[] = [];

  //       if (!profile.accessToken || !profile.canRequest) {
  //         invalidProfiles.push({
  //           id: 0,
  //           profile: profile.profile,
  //           ad_account: "",
  //           account_status: "",
  //           effective_status: "",
  //           disable_reason: "",
  //           campaign_name: "",
  //           daily_budget: "",
  //           domain_name: [],
  //           spend: "",
  //           links: [],
  //           ad_checker_summary: { code: 400, message: profile.status },
  //           targeting_geo: [],
  //         });

  //         setTableData((prev) => [...prev, ...invalidProfiles]);

  //         // update progress
  //         setAdCheckerProgress((prev) => Math.min(100, prev + divisor));
  //         return;
  //       }

  //       try {
  //         setProfile(profile.profile);

  //         const { data } = await fbAdsManagerService.adChecker({
  //           access_token: profile.accessToken.trim(),
  //         });
  //         const adData: AdData[] = data.map((ad) => {
  //           const links: AdCreatives[] =
  //             ad?.adcreatives?.map((creative: Record<string, any>) => ({
  //               image: creative.image_url,
  //               title: creative.title,
  //               message: creative.message,
  //               url: creative.call_to_action?.value?.link ?? "",
  //             })) ?? [];

  //           return {
  //             id: Number(ad.id) || 0,
  //             profile: profile.profile,
  //             ad_account: ad.ad_account_name || "",
  //             effective_status: ad.effective_status,
  //             account_status: ad.account_status,
  //             disable_reason: ad.disable_reason,
  //             campaign_name: ad.name || "",
  //             created_at: ad.created_at || "",
  //             daily_budget: ad.daily_budget,
  //             domain_name: ad.domain || [],
  //             spend: ad.spend || 0,
  //             links,
  //             ad_checker_summary: ad.ad_checker_summary,
  //             targeting_geo: ad.targeting_countries || [],
  //           };
  //         });

  //         const sortedAdData = adData.sort(
  //           (a, b) => b.ad_checker_summary?.code - a.ad_checker_summary?.code
  //         );

  //         setTableData((prev) => [...prev, ...sortedAdData]);
  //       } catch (error) {
  //         console.error("AdChecker error:", error);
  //       } finally {
  //         // update progress after each profile finishes (success or fail)
  //         setAdCheckerProgress((prev) => Math.min(100, prev + divisor));
  //       }
  //     })
  //   );

  //   //For refresh feature debugging
  //   // const adData: AdData[] = staticData.map((ad) => {
  //   //   const links: AdCreatives[] =
  //   //     ad?.adcreatives?.map((creative: Record<string, any>) => ({
  //   //       image: creative.image_url,
  //   //       title: creative.title,
  //   //       message: creative.message,
  //   //       url: creative.call_to_action?.value?.link ?? "",
  //   //     })) ?? [];

  //   //   return {
  //   //     id: ad.ad_account_id || 0,
  //   //     profile: "PH-AP OXY 10903",
  //   //     ad_account: ad.ad_account_name || "",
  //   //     effective_status: ad.effective_status,
  //   //     account_status: ad.account_status,
  //   //     disable_reason: ad.disable_reason,
  //   //     campaign_name: ad.name || "",
  //   //     daily_budget: ad.daily_budget,
  //   //     domain_name: ad.domain || [],
  //   //     spend: ad.spend || 0,
  //   //     links,
  //   //     ad_checker_summary: ad.ad_checker_summary,
  //   //     targeting_geo: ad.targeting_countries || [],
  //   //   };
  //   // });

  //   // setTableData(adData);
  //   setIsExportReady(true);
  //   setIsActionDisabled(false);
  //   setIsAdCheckerProgressDialogOpen(false);
  // };

  const handleSubmit = async () => {
    setIsActionDisabled(true);
    setTableData([]);
    handleSubmitRequest();
  };

  const handleRefresh = async () => {
    const fbServerErrorData = tableData
      .filter((data) =>
        data.ad_checker_summary?.message.includes("Facebook server error")
      )
      .map((errorData) => {
        const accessToken = validatedProfiles.find(
          (profile) => profile.profile == errorData.profile
        )?.accessToken;
        return {
          ...errorData,
          access_token: errorData.id != 0 ? undefined : accessToken,
        };
      });
    console.log("fbServerErrorData ", fbServerErrorData);
    // await Promise.allSettled(
    //   fbServerErrorData.map(async (errorData) => {
    //     const { data } = await fbAdsManagerService.adChecker({
    //       access_token: String(errorData.access_token).trim(),
    //     });
    //     const adData: AdData[] = data.map((ad) => {
    //       const links: AdCreatives[] =
    //         ad?.adcreatives?.map((creative: Record<string, any>) => ({
    //           image: creative.image_url,
    //           title: creative.title,
    //           message: creative.message,
    //           url: creative.call_to_action?.value?.link ?? "",
    //         })) ?? [];
    //       return {
    //         id: Number(ad.id) || 0,
    //         profile: profile.profile,
    //         ad_account: ad.ad_account_name || "",
    //         effective_status: ad.effective_status,
    //         account_status: ad.account_status,
    //         disable_reason: ad.disable_reason,
    //         campaign_name: ad.name || "",
    //         daily_budget: ad.daily_budget,
    //         domain_name: ad.domain || [],
    //         spend: ad.spend || 0,
    //         links,
    //         ad_checker_summary: ad.ad_checker_summary,
    //         targeting_geo: ad.targeting_countries || [],
    //       };
    //     });
    //   })
    // );
    // const {} = await fbAdsManagerService.adCheckerRefresh({ })
  };

  const handleViewCreatives = (adCreatives: AdCreatives[]) => {
    handleAdCreativesDialogOpen(true);
    setAdCreativeData(adCreatives);
  };

  const handleExportAdInsights = async () => {
    const defaultLinks = { image: "", message: "", title: "", url: "" };
    const fallbackLinks = [defaultLinks, defaultLinks, defaultLinks];
    const plainData = tableData.map((data: AdData) => {
      const {
        ad_account,
        account_status,
        campaign_name,
        created_at,
        daily_budget,
        disable_reason,
        effective_status,
        links,
        profile,
        spend,
      } = data;

      //get the highest length of links
      const maxLength = Math.max(...tableData.map((link) => link.links.length));
      // fill default links if the links is only less than 3
      const linksAdded =
        links?.length > 0
          ? Array(maxLength - links.length).fill(defaultLinks)
          : [];
      // spread the filled links if the links is only less than 3
      const checkedLinks = links.length < 3 ? [...links, ...linksAdded] : links;
      const validLinks = links.length > 0 ? checkedLinks : fallbackLinks;
      const linksResult: Record<string, string> = {};
      validLinks.forEach((link: AdLinks, idx: number) => {
        for (const key in link) {
          const linkValue = link[key as keyof AdLinks];
          linksResult[`${key}${idx + 1}`] = linkValue ? linkValue : "";
        }
      });

      const delivery =
        data.account_status == "ACTIVE" ? effective_status : account_status;
      const adCheckerSummary = data.ad_checker_summary
        ? `${data.ad_checker_summary.message.join(". ")} ${
            data.ad_checker_summary.code == 500 ? "\n SUSPICIOUS" : ""
          }`
        : "";
      const hasDateCreated = "created_at" in data;

      return {
        profile,
        ad_account,
        ad_checker_summary: adCheckerSummary,
        delivery: delivery ? delivery : "",
        disable_reason,
        campaign_name,
        date_created: hasDateCreated ? created_at : "",
        daily_budget,
        spend,
        domain_name:
          data.domain_name?.length > 0
            ? data.domain_name.map((d: { name: string }) => d.name).join(", ")
            : "",
        targeting_geo:
          data.targeting_geo?.length > 0 ? data.targeting_geo.join(", ") : "",
        ...linksResult,
      };
    });

    const sanitizeObject = <T extends Record<string, any>>(obj: T): T =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v == null ? "" : v])
      ) as T;

    const sanitizedData = plainData.map(sanitizeObject);
    try {
      const csv = await jsonCsvManager.convertJsonToCSV(sanitizedData);

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const todayDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = `exported-data-${todayDate.replaceAll("/", "-")}.csv`;
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
      <div>
        <div className="text-xl">Ad Checker</div>
        <p className="text-sm">
          Secure your campaigns by checking for hacked or malicious ads.
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
        progress={Number(adCheckerProgress.toFixed())}
      />

      <div className="flex gap-4 h-[calc(100dvh-12rem)] mt-4 pr-4">
        <AdCheckerSidebar
          isExportReady={isExportReady}
          isActionDisabled={isActionDisabled}
          onExportData={handleExportAdInsights}
          onSubmit={handleSubmit}
          onSetValidatedProfiles={handleSetValidatedProfiles}
          validatedProfiles={validatedProfiles}
        />
        <AdCheckerTable
          onRefresh={handleRefresh}
          onViewCreatives={handleViewCreatives}
          tableData={tableData}
        />
      </div>
    </div>
  );
}
