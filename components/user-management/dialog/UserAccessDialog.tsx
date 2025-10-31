"use-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, UseFormReturn } from "react-hook-form";
import { StepProgress } from "@/components/shared/step-progress/StepProgress";
import { genderList } from "../static-data";
import { MultiSelectComboBoxV2 } from "@/components/shared/select/MultiSelectComboBoxV2";
import {
  MenuAccess,
  UserAccessFormValues,
} from "../user-access/table/UserAccessTableContainer";
import { useUserAccessContext } from "@/context/user-access/UserAccessContext";
import { RHFInput } from "@/components/shared/rhf/RHFInput";
import { RHFSelect } from "@/components/shared/rhf/RHFSingleSelect";
import { RHFPasswordToggleInput } from "@/components/shared/rhf/RHFPasswordToggleInput";

type Props = {
  isAddingNew: boolean;
  isActionDisabled: boolean;
  onBrandChange: (value: string[]) => void;
  onMenuChange: (value: string[], type: "mainMenu" | "subMenu") => void;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: UserAccessFormValues) => void;
  selectedBrandAccess: string[];
  selectedMenuAccess: MenuAccess;
  open: boolean;
  userAccessForm: UseFormReturn<
    UserAccessFormValues,
    any,
    UserAccessFormValues
  >;
};

const TOTAL_STEPS = 3;

export function UserAccessDialog({
  isAddingNew,
  isActionDisabled,
  onBrandChange,
  onMenuChange,
  onOpenChange,
  onSubmit,
  selectedBrandAccess,
  selectedMenuAccess,
  open,
  userAccessForm,
}: Props) {
  const { brands, menuSelectOptions, userSelectOptions } =
    useUserAccessContext();
  const [step, setStep] = useState(1);
  const { control, formState, getValues, handleSubmit, reset, trigger } =
    userAccessForm;

  const handleClose = () => {
    setStep(1);
    onBrandChange([]);
    onMenuChange([], "mainMenu");
    onMenuChange([], "subMenu");
    reset();
  };

  const sortedMainMenu = menuSelectOptions.main_menu.sort(
    (a, b) => a.sort - b.sort
  );
  const filteredAndSortedSubMenu = menuSelectOptions.sub_menu
    .filter((d) => selectedMenuAccess.mainMenu.includes(d.main_menu_id))
    .sort((a, b) => a.sort - b.sort);

  const nameDetails = {
    full_name: getValues("full_name"),
    display_name: getValues("display_name"),
  };
  const email = getValues("email");
  const menuAccess = {
    main_menu: getValues("main_menu"),
    sub_menu: getValues("sub_menu"),
  };
  const userInfo = {
    user_type: getValues("user_type"),
    team: getValues("team"),
  };

  const handleStep = async (type: "back" | "next") => {
    const stepForm: FieldPath<UserAccessFormValues>[][] = [
      [
        "full_name",
        "display_name",
        "email",
        "password",
        "gender",
        "user_type",
        "team",
      ],
      ["brand", "main_menu", "sub_menu"],
    ];
    const isFormValid = await trigger(stepForm[step - 1]);
    if (isFormValid) {
      setStep((prev) => (type == "back" ? prev - 1 : prev + 1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onCloseAutoFocus={handleClose}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "New" : "Update"} User Entry</DialogTitle>
          <DialogDescription>
            Configure permissions and assign access.
          </DialogDescription>
          <div className="flex justify-between pt-2 relative w-full">
            <StepProgress
              steps={["User Info", "Add Permissions", "Review and Confirm"]}
              currentStep={step}
            />
          </div>
          <DialogClose
            disabled={isActionDisabled || formState.isSubmitting}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <Form {...userAccessForm}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            {step == 1 && (
              <>
                <RHFInput
                  control={control}
                  name="full_name"
                  label="Full Name"
                  placeholder="input"
                />
                <RHFInput
                  control={control}
                  name="display_name"
                  label="Display Name"
                  placeholder="input"
                  isOptional
                />

                <RHFInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="your.email@example.com"
                  type="email"
                />

                <RHFPasswordToggleInput
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="input"
                />

                <RHFSelect
                  control={control}
                  name="gender"
                  label="Gender"
                  placeholder="Select gender"
                  options={genderList}
                />

                <RHFSelect
                  control={control}
                  name="user_type"
                  label="User Type"
                  placeholder="Select user type"
                  options={userSelectOptions.user_types}
                />

                <RHFSelect
                  control={control}
                  name="team"
                  label="Team"
                  placeholder="Select team"
                  options={userSelectOptions.teams}
                />
              </>
            )}

            {step == 2 && (
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Menu</FormLabel>
                      <FormControl>
                        <MultiSelectComboBoxV2
                          label="Select main menu"
                          options={sortedMainMenu}
                          onSelectValue={(value) => {
                            onMenuChange(value, "mainMenu");
                            field.onChange(value);
                          }}
                          selectedValue={selectedMenuAccess.mainMenu}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="sub_menu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub Menu</FormLabel>
                      <FormControl>
                        <MultiSelectComboBoxV2
                          label="Select sub menu"
                          options={filteredAndSortedSubMenu}
                          onSelectValue={(value) => {
                            onMenuChange(value, "subMenu");
                            field.onChange(value);
                          }}
                          selectedValue={selectedMenuAccess.subMenu}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step == 3 && (
              <div className="grid gap-4 px-1 text-sm">
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div>{nameDetails.full_name}</div>
                  <div className="text-muted-foreground">
                    {nameDetails.display_name}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div>{email}</div>
                </div>

                <div>
                  <div className="text-muted-foreground">Brand Access</div>
                  {selectedBrandAccess.map((selBrandAccess) => {
                    const brandLabel = brands.find(
                      (b: { value: string }) => b.value == selBrandAccess
                    )?.label;
                    return <div key={brandLabel}>{brandLabel}</div>;
                  })}
                </div>

                <div>
                  <div className="text-muted-foreground">Menu Access</div>
                  {selectedMenuAccess.mainMenu.map((selMenuAccess) => {
                    const mainMenuLabel = menuSelectOptions.main_menu.find(
                      (mm) => mm.value == selMenuAccess
                    )?.label;
                    return <div key={mainMenuLabel}>{mainMenuLabel}</div>;
                  })}
                </div>

                <div>
                  <div className="text-muted-foreground">Sub Menu Access</div>
                  {selectedMenuAccess.subMenu.map((selSubMenuAccess) => {
                    const subMenuLabel = menuSelectOptions.sub_menu.find(
                      (sm) => sm.value == selSubMenuAccess
                    )?.label;
                    return <div key={subMenuLabel}>{subMenuLabel}</div>;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {step > 1 && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled || formState.isSubmitting}
                  onClick={() => handleStep("back")}
                  type="button"
                  variant={"outline"}
                >
                  Back
                </Button>
              )}

              {step < TOTAL_STEPS && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled}
                  onClick={() => handleStep("next")}
                  type="button"
                >
                  Next
                </Button>
              )}

              {step == TOTAL_STEPS && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled || formState.isSubmitting}
                  type="submit"
                >
                  {formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
