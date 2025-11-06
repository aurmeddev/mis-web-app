import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MenuAccessItem } from "../../menu-access/MenuAccessItem";
import { MultiSelectComboBoxV2 } from "@/components/shared/select/MultiSelectComboBoxV2";
import { StepFieldsProps } from "../../UserAccess.types";

export const Step2Fields = ({
  brands,
  control,
  menuStructure,
  onParentChange,
  onChildChange,
  onBrandChange,
  selectedBrandAccess,
  watchedMainMenus,
  watchedSubMenus,
}: StepFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <FormControl>
              <MultiSelectComboBoxV2
                label="Select brand"
                options={brands}
                onSelectValue={(value) => {
                  onBrandChange(value);
                  field.onChange(value);
                }}
                selectedValue={selectedBrandAccess}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="main_menu"
        render={() => (
          <FormItem>
            <FormLabel>Menus</FormLabel>
            <FormControl>
              <div className="max-h-[35dvh] overflow-auto">
                {menuStructure.map((parent) => (
                  <MenuAccessItem
                    key={parent.main_menu_id}
                    parent={parent}
                    watchedMainMenus={watchedMainMenus}
                    watchedSubMenus={watchedSubMenus}
                    handleParentChange={onParentChange}
                    handleChildChange={onChildChange}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
