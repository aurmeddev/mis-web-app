import { Step3ReviewProps } from "../../UserAccess.types";

export const Step3Review = ({
  watchedFullName,
  watchedDisplayName,
  watchedEmail,
  brands,
  selectedBrandAccess,
  selectedMenuStructure,
}: Step3ReviewProps) => (
  <div className="grid gap-4 px-1 text-sm">
    <div>
      <div className="text-muted-foreground">Name</div>
      <div>{watchedFullName}</div>
      <div className="text-muted-foreground">{watchedDisplayName}</div>
    </div>

    <div>
      <div className="text-muted-foreground">Email</div>
      <div>{watchedEmail}</div>
    </div>

    <div>
      <div className="text-muted-foreground">Brand Access</div>
      {selectedBrandAccess.length > 0 ? (
        selectedBrandAccess.map((selBrandAccess) => {
          const brandLabel = brands.find(
            (b: { value: string }) => b.value === selBrandAccess
          )?.label;
          return <div key={brandLabel}>{brandLabel}</div>;
        })
      ) : (
        <div>None</div>
      )}
    </div>

    <div>
      <div className="text-muted-foreground">Menu Access</div>
      {selectedMenuStructure.map((selMenuAccess) => (
        <div key={selMenuAccess.label} className="mb-2 space-y-1">
          {selMenuAccess.label}
          {selMenuAccess.sub_menu.map((selSubAccess) => (
            <div key={selSubAccess.label} className="ml-2">
              - {selSubAccess.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);
