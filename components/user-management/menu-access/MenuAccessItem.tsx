import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";

type SubMenu = {
  sub_menu_id: string;
  label: string;
};

type ParentMenu = {
  main_menu_id: string;
  label: string;
  sub_menu: SubMenu[];
};

type MenuAccessItemProps = {
  parent: ParentMenu;
  watchedMainMenus: string[];
  watchedSubMenus: string[];
  handleParentChange: (checked: CheckedState, main_menu_id: string) => void;
  handleChildChange: (
    checked: CheckedState,
    sub_menu_id: string,
    parent_main_menu_id: string
  ) => void;
};

export const MenuAccessItem = ({
  parent,
  watchedMainMenus,
  watchedSubMenus,
  handleParentChange,
  handleChildChange,
}: MenuAccessItemProps) => {
  const isParentChecked = watchedMainMenus.includes(parent.main_menu_id);

  return (
    <div key={parent.main_menu_id} className="mb-2 space-y-3 border-t py-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isParentChecked}
          id={`main-${parent.main_menu_id}`}
          onCheckedChange={(checked) =>
            handleParentChange(checked, parent.main_menu_id)
          }
        />
        <Label
          className="font-semibold text-base"
          htmlFor={`main-${parent.main_menu_id}`}
        >
          {parent.label}
        </Label>
      </div>

      <div className="flex flex-col ml-6 gap-y-1">
        {parent.sub_menu.map((child) => {
          const isChildChecked = watchedSubMenus.includes(child.sub_menu_id);

          return (
            <div
              key={child.sub_menu_id}
              className="flex items-center space-x-2"
            >
              <Checkbox
                checked={isChildChecked}
                id={`sub-${child.sub_menu_id}`}
                onCheckedChange={(checked) =>
                  handleChildChange(
                    checked,
                    child.sub_menu_id,
                    parent.main_menu_id
                  )
                }
              />
              <Label htmlFor={`sub-${child.sub_menu_id}`} className="text-sm">
                {child.label}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
