"use client";
import { useState } from "react";
import { CampaignNameGenerator } from "./CampaignNameGenerator";
import { SelectOptions } from "@/components/shared/select/type";
import { cn } from "@/lib/utils";

type Props = {
  brands: SelectOptions[];
  geos: SelectOptions[];
  mediaBuyers: SelectOptions[];
};

type LoginCodes = {
  sort: number;
  text: string;
};

export type CampaignName = {
  brand: string;
  budgetOptimizationType: string;
  campaignID: string;
  loginCodes: LoginCodes[];
  geo: string;
  mediaBuyer: string;
};

export type CampaignNameUpdate = {
  name: string;
  value: string;
  index?: number;
};

const initialCampaignNameObj = {
  brand: "",
  budgetOptimizationType: "",
  campaignID: "",
  geo: "",
  loginCodes: [{ sort: 1, text: "" }],
  mediaBuyer: "",
};

const utilitiesTab = [
  { name: "campaign-name-generator", title: "Campaign Name Generator" },
  { name: "website-url-generator", title: "Website URL Generator" },
];

export function UtilitiesContainer({ brands, geos, mediaBuyers }: Props) {
  const [tab, setTab] = useState<{ name: string; title: string }>(
    utilitiesTab[0]
  );
  const [campaignName, setCampaignName] = useState<CampaignName>(
    initialCampaignNameObj
  );

  const handleCampaignNameUpdate = ({
    name,
    value,
    index,
  }: CampaignNameUpdate) => {
    if (name == "loginCodes") {
      setCampaignName((prevState) => {
        const updatedLoginCodes = [...prevState.loginCodes];
        updatedLoginCodes[index || 0] = {
          ...updatedLoginCodes[index || 0],
          text: value,
        };
        return {
          ...prevState,
          loginCodes: updatedLoginCodes,
        };
      });
    } else if (name == "clear") {
      setCampaignName(initialCampaignNameObj);
    } else {
      setCampaignName((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleUpdateLoginInput = (type: "add" | "remove") => {
    setCampaignName((prevState) => {
      if (type === "add") {
        return {
          ...prevState,
          loginCodes: [
            ...prevState.loginCodes,
            {
              sort: prevState.loginCodes.length + 1,
              text: "",
            },
          ],
        };
      }

      if (type === "remove") {
        return {
          ...prevState,
          loginCodes: prevState.loginCodes.slice(0, -1),
        };
      }

      return prevState;
    });
  };

  const handlePresetChange = ({
    brand,
    geo,
  }: Pick<CampaignName, "brand" | "geo">) => {
    setCampaignName((prevState) => ({ ...prevState, brand, geo }));
  };

  return (
    <>
      <div
        className={cn(
          "*:hover:cursor-pointer *:hover:border-b-2 *:hover:border-b-primary bg-muted flex gap-4 px-10 text-sm w-full"
        )}
      >
        {utilitiesTab.map((ut, idx) => (
          <div
            key={idx}
            className={cn(
              "py-4 pr-0",
              tab.name == ut.name &&
                "border-2 border-x-0 border-t-0 border-b-primary"
            )}
            onClick={() => setTab(ut)}
          >
            {ut.title}
          </div>
        ))}
      </div>

      <div className="py-6 px-10">
        {tab.name == "campaign-name-generator" ? (
          <CampaignNameGenerator
            brands={brands}
            campaignName={campaignName}
            geos={geos}
            mediaBuyers={mediaBuyers}
            onCampaignNameUpdate={handleCampaignNameUpdate}
            onUpdateLoginInput={handleUpdateLoginInput}
            onPresetChange={handlePresetChange}
          />
        ) : (
          <div>Website URL Generator</div>
        )}
      </div>
    </>
  );
}
