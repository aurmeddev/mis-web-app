"use client";
import { GlobalComboBoxSelect } from "@/components/shared/select/GlobalComboBoxSelect";
import { GlobalSelect } from "@/components/shared/select/GlobalSelect";
import { SelectOptions } from "@/components/shared/select/type";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CampaignName, CampaignNameUpdate } from "./UtilitiesContainer";
import { BrushCleaning, MinusCircle, PlusCircle } from "lucide-react";
import { useRef, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Props = {
  brands: SelectOptions[];
  campaignName: CampaignName;
  geos: SelectOptions[];
  mediaBuyers: SelectOptions[];
  onCampaignNameUpdate: ({ name, value, index }: CampaignNameUpdate) => void;
  onUpdateLoginInput: (type: "add" | "remove") => void;
  onPresetChange: ({ brand, geo }: Pick<CampaignName, "brand" | "geo">) => void;
};

const budgetOptimizationList = [
  {
    id: 1,
    label: "ABO",
    value: "ABO",
  },
  { id: 2, label: "Branding", value: "Branding" },
  { id: 3, label: "CBO", value: "CBO" },
];

const presetList = [
  {
    label: "KING33-MY",
    value: {
      brand: "KING333",
      geo: "MY",
    },
  },
  {
    label: "IBC22-MY",
    value: {
      brand: "IBC22",
      geo: "MY",
    },
  },
  {
    label: "IBC22-SG",
    value: {
      brand: "IBC22",
      geo: "SG",
    },
  },
  {
    label: "WILD33-MY",
    value: {
      brand: "WILD33",
      geo: "MY",
    },
  },
  {
    label: "RWS77-MY",
    value: {
      brand: "RWS77",
      geo: "MY",
    },
  },
  {
    label: "MINT33-MY",
    value: {
      brand: "MINT33",
      geo: "MY",
    },
  },
];

export function CampaignNameGenerator({
  brands,
  campaignName,
  geos,
  mediaBuyers,
  onCampaignNameUpdate,
  onUpdateLoginInput,
  onPresetChange,
}: Props) {
  const campLevelTextRef = useRef<HTMLDivElement>(null);
  const adsetLevelTextRef = useRef<HTMLDivElement>(null);

  const [copiedCampLevel, setCopiedCampLevel] = useState(false);
  const [copiedAdsetLevel, setCopiedAdsetLevel] = useState(false);

  const isCBO = campaignName.budgetOptimizationType == "CBO";
  const canCopy = campaignName.loginCodes.some((value) => value.text !== "");

  const handleCopy = async (
    ref: React.RefObject<HTMLDivElement | null>,
    setCopied: (v: boolean) => void
  ) => {
    if (ref.current) {
      const text = ref.current.innerText.trim().replaceAll("\n", "");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClear = () => {
    onCampaignNameUpdate({ name: "clear", value: "" });
  };

  const handlePresetChange = (value: string) => {
    const selectedPreset = presetList.find((pl) => pl.label == value)?.value;
    onPresetChange({
      brand: selectedPreset?.brand || "",
      geo: selectedPreset?.geo || "",
    });
  };

  return (
    <div className="flex gap-6">
      <div className="min-w-md pr-6 w-[40%]">
        <form>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Campaign Name Generator</FieldLegend>
              <FieldDescription>
                {"Let's create your desired campaign name!"}
              </FieldDescription>
              <FieldGroup className="gap-4">
                {campaignName.loginCodes.map((login, idx) => (
                  <Field key={idx}>
                    <FieldLabel htmlFor="login-code-1">
                      Login Code {idx + 1}
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id={`login-code-${idx}`}
                        placeholder={`Enter Login Code ${idx + 1}`}
                        onChange={(ev) =>
                          onCampaignNameUpdate({
                            name: "loginCodes",
                            value: ev.target.value,
                            index: idx,
                          })
                        }
                        value={login.text}
                      />
                      {idx == 0 ? (
                        <Button
                          className="absolute cursor-pointer h-7 -translate-y-1/2 right-1 top-1/2"
                          onClick={() => onUpdateLoginInput("add")}
                          size={"sm"}
                          type="button"
                        >
                          <PlusCircle /> Add
                        </Button>
                      ) : (
                        <Button
                          className="absolute cursor-pointer h-7 -translate-y-1/2 right-1 top-1/2"
                          onClick={() => onUpdateLoginInput("remove")}
                          size={"sm"}
                          type="button"
                          variant={"destructive"}
                        >
                          <MinusCircle /> Remove
                        </Button>
                      )}
                    </div>
                  </Field>
                ))}
                {/* <div className="relative border border-dashed">
                  <Button
                    className="absolute cursor-pointer -translate-1/2 top-1/2 left-1/2"
                    size={"sm"}
                    variant={"outline"}
                  >
                    <PlusCircle /> Add
                  </Button>
                </div> */}
                <Field>
                  <FieldLabel>List of Brands</FieldLabel>
                  <GlobalComboBoxSelect
                    options={brands}
                    placeholder="Select Brand"
                    onSelectedValue={(value) =>
                      onCampaignNameUpdate({ name: "brand", value })
                    }
                    value={campaignName.brand}
                  />
                </Field>
                <Field>
                  <FieldLabel>List of Geos</FieldLabel>
                  <GlobalSelect
                    isDisabled={!campaignName.brand}
                    options={geos}
                    onSelectedValue={(value) =>
                      onCampaignNameUpdate({ name: "geo", value })
                    }
                    placeholder="Select Geo"
                    value={campaignName.geo}
                  />
                </Field>
                <Field>
                  <FieldLabel>List of Budget Optimization Type</FieldLabel>
                  <GlobalSelect
                    isDisabled={!campaignName.geo}
                    options={budgetOptimizationList}
                    onSelectedValue={(value) =>
                      onCampaignNameUpdate({
                        name: "budgetOptimizationType",
                        value,
                      })
                    }
                    placeholder="Select Budget Optimization Type"
                    value={campaignName.budgetOptimizationType}
                  />
                </Field>
                <Field>
                  <FieldLabel>List of Media Buyers</FieldLabel>
                  <GlobalComboBoxSelect
                    isDisabled={!campaignName.budgetOptimizationType}
                    options={mediaBuyers}
                    onSelectedValue={(value) =>
                      onCampaignNameUpdate({
                        name: "mediaBuyer",
                        value,
                      })
                    }
                    placeholder="Select Media Buyer"
                    value={campaignName.mediaBuyer}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="campaign-id">Campaign ID</FieldLabel>
                  <Input
                    id="campaign-id"
                    onChange={(ev) =>
                      onCampaignNameUpdate({
                        name: "campaignID",
                        value: ev.target.value,
                      })
                    }
                    placeholder="Enter Campaign ID"
                    value={campaignName.campaignID}
                  />
                </Field>

                <Button
                  className="cursor-pointer max-w-fit"
                  onClick={handleClear}
                  type="button"
                  variant={"outline"}
                >
                  <BrushCleaning /> Clear
                </Button>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form>
      </div>

      <div className="flex flex-1 flex-col gap-6 justify-center text-sm">
        <div>
          <FieldGroup>
            <FieldSet>
              <FieldLabel htmlFor="compute-environment-p8w">
                Select Preset
              </FieldLabel>
              <RadioGroup
                className="flex flex-wrap"
                onValueChange={handlePresetChange}
              >
                {presetList.map((pl, idx) => (
                  <FieldLabel
                    key={idx}
                    className="flex-[0_0_calc(33%-var(--spacing)*3)]"
                    htmlFor={pl.label}
                  >
                    <Field orientation="responsive">
                      <FieldContent>
                        <FieldTitle>{pl.label}</FieldTitle>
                      </FieldContent>
                      <RadioGroupItem value={pl.label} id={pl.label} />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </FieldSet>
          </FieldGroup>
        </div>
        {/* Campaign Level */}
        <div className="flex flex-col gap-2">
          <div className="font-medium">Campaign Level</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div
              ref={campLevelTextRef}
              className="flex flex-wrap items-center bg-green-100 border border-green-300 rounded-lg py-3 px-4 w-full sm:flex-1 text-sm break-words"
            >
              {campaignName.loginCodes.map((login, idx) => {
                const isLast = idx === campaignName.loginCodes.length - 1;
                if (!login.text)
                  return (
                    <div key={idx} className="opacity-0">
                      -
                    </div>
                  );
                return (
                  <div key={idx}>
                    {login.text}
                    {!isLast && "-"}
                  </div>
                );
              })}
              {campaignName.brand && <div>_{campaignName.brand}</div>}
              {campaignName.geo && <div>_{campaignName.geo}</div>}
              {campaignName.budgetOptimizationType && (
                <div>_{campaignName.budgetOptimizationType}</div>
              )}
              {campaignName.mediaBuyer && <div>_{campaignName.mediaBuyer}</div>}
              {campaignName.campaignID && !isCBO && (
                <div>_{campaignName.campaignID}</div>
              )}
            </div>
            <Button
              className="cursor-pointer w-full sm:w-auto"
              disabled={!canCopy}
              onClick={() => handleCopy(campLevelTextRef, setCopiedCampLevel)}
              variant="ghost"
            >
              {copiedCampLevel ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>

        {/* Adsets Level */}
        <div className="flex flex-col gap-2">
          <div className="font-medium">Adsets Level</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div
              ref={adsetLevelTextRef}
              className="flex flex-wrap items-center bg-green-100 border border-green-300 rounded-lg py-3 px-4 w-full sm:flex-1 text-sm break-words"
            >
              {campaignName.loginCodes.map((login, idx) => {
                const isLast = idx === campaignName.loginCodes.length - 1;
                if (!login.text)
                  return (
                    <div key={idx} className="opacity-0">
                      -
                    </div>
                  );
                return (
                  <div key={idx}>
                    {login.text}
                    {!isLast && "-"}
                  </div>
                );
              })}
              {campaignName.brand && <div>_{campaignName.brand}</div>}
              {campaignName.geo && <div>_{campaignName.geo}</div>}
              {campaignName.budgetOptimizationType && (
                <div>_{campaignName.budgetOptimizationType}</div>
              )}
              {campaignName.mediaBuyer && <div>_{campaignName.mediaBuyer}</div>}
              {campaignName.campaignID && <div>_{campaignName.campaignID}</div>}
            </div>
            <Button
              className="cursor-pointer w-full sm:w-auto"
              disabled={!canCopy}
              onClick={() => handleCopy(adsetLevelTextRef, setCopiedAdsetLevel)}
              variant="ghost"
            >
              {copiedAdsetLevel ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
