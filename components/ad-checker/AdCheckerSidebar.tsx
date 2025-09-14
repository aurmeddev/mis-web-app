"use client";
import { useDebouncedCallback } from "use-debounce";
import { ChangeEvent, startTransition, useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Trash2, X } from "lucide-react";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { Progress } from "../ui/progress";
import { ProfileMarketingApiAccessToken } from "./AdCheckerContainer";

type Props = {
  isActionDisabled: boolean;
  onSubmit: () => void;
  onSetValidatedProfiles: (data: Array<ProfileMarketingApiAccessToken>) => void;
  validatedProfiles: Array<ProfileMarketingApiAccessToken>;
};

export function AdCheckerSidebar({
  isActionDisabled,
  onSubmit,
  onSetValidatedProfiles,
  validatedProfiles,
}: Props) {
  const profilesService = new ApProfilesService();
  const [extractedProfiles, setExtractedProfiles] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);

  const handleProfileChangeDebounce = useDebouncedCallback(
    async (data: string) => {
      if (/^\s+$/.test(data) || !data) {
        return;
      }
      const splitProfiles = formatInputProfile(data);
      const distinctProfiles = new Set(splitProfiles);
      const destructedProfiles = [...distinctProfiles];
      setExtractedProfiles(destructedProfiles);
      const profileMarketingApiAccessToken = await getAccessToken(
        destructedProfiles
      );
      onSetValidatedProfiles(profileMarketingApiAccessToken);
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
      onSetValidatedProfiles(filteredProfiles);
    } else {
      onSetValidatedProfiles([]);
    }
  };

  const getAccessToken = async (profiles: string[]) => {
    const results: Array<ProfileMarketingApiAccessToken> = [];

    const divisor = (100 / profiles.length).toFixed();
    for (const profile of profiles) {
      setProgress((prev) => {
        const currentProgress = (prev += Number(divisor));
        return currentProgress >= 99 ? 100 : currentProgress;
      });
      const { isSuccess, data } = await profilesService.find({
        method: "find-one",
        searchKeyword: profile,
      });
      const accessToken =
        data[0]?.fb_account.marketing_api_access_token || null;
      results.push({ profile, accessToken });
    }

    startTransition(() => setProgress(0));

    return results;
  };

  const currentProgressPosition = getPositionFromPercentage(
    progress,
    extractedProfiles.length
  );

  return (
    <div className="flex flex-col space-y-2 w-[30%]">
      <div className="border relative rounded">
        {validatedProfiles.length >= 1 && (
          <div className="flex flex-wrap gap-2 p-2 w-full">
            {validatedProfiles.map((data, idx) => (
              <Badge
                key={idx}
                className="flex relative"
                variant={!data.accessToken ? "destructive" : "secondary"}
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
            ))}
          </div>
        )}

        {currentProgressPosition == 0 && (
          <Input
            className="bg-transparent border-none focus-visible:ring-0 shadow-none outline-none placeholder:text-muted-foreground"
            disabled={progress !== 0}
            onChange={handleProfileChange}
            name="profiles"
            placeholder="Enter profile(s)"
          />
        )}

        {validatedProfiles.length > 0 && (
          <Button
            className="absolute bg-transparent bottom-0 cursor-pointer opacity-70 right-0 hover:opacity-100 hover:bg-transparent"
            onClick={() => handleRemoveProfile({ removeAll: true })}
            variant={"link"}
          >
            <Trash2 />
          </Button>
        )}

        {extractedProfiles.length >= 1 &&
          currentProgressPosition !== validatedProfiles.length &&
          currentProgressPosition !== 0 && (
            <div className="bg-secondary p-2 relative w-full">
              <div className="font-semibold mb-2 text-xs text-muted-foreground">
                Processing profiles...
              </div>
              <Progress value={progress} className="w-full" />

              <div className="flex font-semibold justify-between text-muted-foreground text-xs">
                <div>
                  {currentProgressPosition}/{extractedProfiles.length} profiles.
                </div>
                <div>{progress}%</div>
              </div>
            </div>
          )}
      </div>
      <Button
        className="cursor-pointer"
        onClick={onSubmit}
        disabled={progress !== 0 || isActionDisabled}
      >
        Submit
      </Button>
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
