"use client";
import { useDebouncedCallback } from "use-debounce";
import { ChangeEvent, startTransition, useState } from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Trash2, X } from "lucide-react";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { Progress } from "../../ui/progress";
import { ProfileMarketingApiAccessToken } from "./AdCheckerContainer";
import { FacebookAdsManagerClientService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerClientService";
import { toast } from "sonner";
import { GlobalTooltip } from "../../shared/tooltip/GlobalTooltip";

type Props = {
  isExportReady: boolean;
  isActionDisabled: boolean;
  onExportData: () => void;
  onSubmit: () => void;
  onSetValidatedProfiles: (
    data: ProfileMarketingApiAccessToken[],
    isRemove: boolean
  ) => void;
  validatedProfiles: ProfileMarketingApiAccessToken[];
};

export function AdCheckerSidebar({
  isExportReady,
  isActionDisabled,
  onExportData,
  onSubmit,
  onSetValidatedProfiles,
  validatedProfiles,
}: Props) {
  const profilesService = new ApProfilesService();
  const [addedProfiles, setAddedProfiles] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProfileChangeDebounce = useDebouncedCallback(
    async (data: string) => {
      if (/^\s+$/.test(data) || !data) {
        return;
      }
      const splitProfiles = formatInputProfile(data);
      const distinctProfiles = new Set(splitProfiles);
      const destructuredProfiles = [...distinctProfiles];

      const hasCommon = validatedProfiles.some((item) =>
        destructuredProfiles.includes(item.profile)
      );
      if (hasCommon) {
        toast.info("Duplicate profile(s) detected.");
        return;
      }

      setAddedProfiles(destructuredProfiles);
      // setExtractedProfiles((prevState) => [
      //   ...prevState,
      //   ...destructuredProfiles,
      // ]);
      setIsProcessing(true);
      const profileMarketingApiAccessToken = await getAccessToken(
        destructuredProfiles
      );
      setIsProcessing(false);
      onSetValidatedProfiles(profileMarketingApiAccessToken, false);
    },
    500
  );

  const handleProfileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    handleProfileChangeDebounce(e.target.value);
    e.target.value = "";
  };

  const handleRemoveProfile = ({
    profileName,
    removeAll,
  }: {
    profileName?: string;
    removeAll?: boolean;
  }) => {
    if (!removeAll) {
      const filteredProfiles = validatedProfiles.filter(
        (data) => !data.profile.includes(String(profileName))
      );
      onSetValidatedProfiles(filteredProfiles, true);
    } else {
      // setExtractedProfiles([]);
      onSetValidatedProfiles([], true);
    }
  };

  // const getAccessToken = async (profiles: string[]) => {
  //   const divisor = 100 / profiles.length;

  //   const promises = profiles.map(async (profile, _) => {
  //     const { data, message } = await profilesService.find({
  //       method: "find-one",
  //       searchKeyword: profile,
  //     });

  //     let accessToken: string = "";
  //     let canRequest = true;
  //     const status: string[] = [];

  //     if (data.length > 0) {
  //       accessToken = data[0]?.fb_account.marketing_api_access_token || null;
  //       if (accessToken) {
  //         const adsManagerApi = new FacebookAdsManagerClientService();
  //         const { isSuccess, data, message } =
  //           await adsManagerApi.accessTokenDebugger({
  //             access_token: accessToken,
  //           });

  //         if (!isSuccess) {
  //           status.push(data[0].status);
  //           canRequest = false;
  //         }
  //       } else {
  //         canRequest = false;
  //         status.push("Missing access token");
  //       }
  //     } else {
  //       canRequest = false;
  //       status.push(message);
  //     }
  //     setProgress((prev) => Math.min(100, prev + divisor));

  //     return { profile, accessToken, status, canRequest };
  //   });

  //   const settledResults = await Promise.allSettled(promises);

  //   const results: any[] = settledResults.map((res) =>
  //     res.status === "fulfilled"
  //       ? res.value
  //       : {
  //           profile: "",
  //           accessToken: null,
  //           status: [String(res.reason)],
  //           canRequest: false,
  //         }
  //   );

  //   startTransition(() => setProgress(0));

  //   return results;
  // };

  const getAccessToken = async (profiles: string[]) => {
    const results: ProfileMarketingApiAccessToken[] = [];

    const divisor = 100 / profiles.length;

    for (const profile of profiles) {
      const { data, message } = await profilesService.find({
        method: "find-one",
        searchKeyword: profile,
      });

      let accessToken = null;
      let canRequest = true;
      const status = [];
      if (data.length > 0) {
        accessToken = data[0]?.fb_account.marketing_api_access_token || null;
        if (accessToken) {
          const adsManagerApi = new FacebookAdsManagerClientService();
          const { isSuccess, data, message } =
            await adsManagerApi.accessTokenDebugger({
              access_token: accessToken,
            });

          if (!isSuccess) {
            status.push(data[0].status);
            canRequest = false;
          }
        } else {
          canRequest = false;
          status.push("Missing access token");
        }
      } else {
        canRequest = false;
        status.push(message);
      }
      setProgress((prev) => Math.min(100, prev + divisor));
      results.push({ profile, accessToken, status, canRequest });
    }

    startTransition(() => setProgress(0));

    return results;
  };

  const currentProgressPosition = getPositionFromPercentage(
    progress,
    addedProfiles.length
  );

  return (
    <div className="border-r flex flex-col pr-4 space-y-2 lg:w-[35%] w-[30%]">
      <div className="border relative rounded">
        {validatedProfiles.length >= 1 && (
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 w-full">
            {validatedProfiles.map((data, idx) => {
              if (!data.canRequest) {
                return (
                  <GlobalTooltip key={idx} tooltipText={data.status[0]}>
                    <Badge
                      className="flex relative"
                      variant={!data.canRequest ? "destructive" : "secondary"}
                    >
                      <div>{data.profile}</div>
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          handleRemoveProfile({ profileName: data.profile })
                        }
                      >
                        <X className="h-4 w-4" />
                      </span>
                    </Badge>
                  </GlobalTooltip>
                );
              }

              return (
                <Badge
                  key={idx}
                  className="flex relative"
                  variant={!data.canRequest ? "destructive" : "secondary"}
                >
                  <div>{data.profile}</div>
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      handleRemoveProfile({ profileName: data.profile })
                    }
                  >
                    <X className="h-4 w-4" />
                  </span>
                </Badge>
              );
            })}
          </div>
        )}

        {isProcessing && (
          <div className="bg-secondary p-2 relative w-full">
            <div className="font-semibold mb-2 text-xs text-muted-foreground">
              Processing profiles...
            </div>
            <Progress value={progress} className="w-full" />

            <div className="flex font-semibold justify-between text-muted-foreground text-xs">
              <div>
                {currentProgressPosition}/{addedProfiles.length} profiles.
              </div>
              <div>{progress.toFixed()}%</div>
            </div>
          </div>
        )}

        {!isProcessing && (
          <Input
            className="bg-transparent border-none focus-visible:ring-0 shadow-none outline-none placeholder:text-muted-foreground"
            disabled={progress !== 0}
            onChange={handleProfileChange}
            name="profiles"
            placeholder="Enter profile(s)"
          />
        )}

        {validatedProfiles.length > 1 && !isProcessing && (
          <Button
            className="absolute bg-transparent bottom-0 cursor-pointer opacity-70 right-0 hover:opacity-100 hover:bg-transparent"
            onClick={() => handleRemoveProfile({ removeAll: true })}
            variant={"link"}
          >
            <Trash2 />
          </Button>
        )}
      </div>
      <Button
        className="cursor-pointer"
        onClick={onSubmit}
        disabled={progress !== 0 || isActionDisabled}
      >
        Run Ad Checker
      </Button>

      {isExportReady && (
        <div className="border rounded p-4 text-sm">
          <div className="font-semibold">Ad Checker Complete</div>
          <div className="text-muted-foreground">
            Your Ad Checker Summary Report is ready to download.
          </div>

          <Button onClick={onExportData} className="cursor-pointer mt-2 w-full">
            Download
          </Button>
        </div>
      )}
    </div>
  );
}

export const getPositionFromPercentage = (
  percentage: number,
  total: number
) => {
  if (percentage <= 0) return 0;
  if (percentage >= 100) return total;
  return Math.round((percentage / 100) * total);
};

const formatInputProfile = (value: string): string[] => {
  const inputText = formatInputText(value.trim());
  const inputArray = inputText.split(" ");
  const outputArray = [];

  for (let i = 0; i < inputArray.length; i += 3) {
    const profile = inputArray.slice(i, i + 3).join(" ");
    if (outputArray.length > 0) {
      const result = outputArray.find((prop) => prop.profile === profile);
      if (result === undefined) {
        outputArray.push(profile);
      }
    } else {
      outputArray.push(profile);
    }
  }

  return outputArray;
};

const formatInputText = (inputText: any) => {
  const inputTextWithoutHC = removeHC(inputText);
  return inputTextWithoutHC.replace(/\s{2,}/g, " "); // Removes all multiple white spaces from the input text, leaving only single spaces
};

// If input contains "[HC]", removes both "[HC]" and any leading whitespace before it
const removeHC = (inputText: any) => {
  return inputText.replace(/\s*\[HC\]/g, "");
};
