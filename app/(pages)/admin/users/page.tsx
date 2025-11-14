import { NotFound } from "@/components/not-found/not-found";
import { SelectOptions } from "@/components/shared/select/type";
import { UserAccessContainer } from "@/components/user-management/user-access/UserAccessContainer";
import { BrandsClientService } from "@/lib/features/brands/BrandsClientService";
import { MenusClientController } from "@/lib/features/menus/MenusClientController";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { TeamsClientController } from "@/lib/features/teams/TeamsClientController";
import { UserClientController } from "@/lib/features/users/manage/UserClientController";

type MainMenuSelectOptions = SelectOptions & {
  sort: number;
};

type SubMenuSelectOptions = MainMenuSelectOptions & {
  main_menu_id: string;
  sort: number;
};

export type UserSelectOptions = {
  teams: SelectOptions[];
  user_types: SelectOptions[];
};

export type MenuSelectOptions = {
  main_menu: MainMenuSelectOptions[];
  sub_menu: SubMenuSelectOptions[];
};

export default async function Page({ searchParams }: any) {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };

  if (!session) return <NotFound param={notFoundObj} />;

  const awaitedParams = await searchParams;
  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 10;
  const params = {
    page,
    limit,
  };

  const brandsApi = new BrandsClientService();
  const brands = await brandsApi.getAll({
    status: "active",
  }); // Get all the active brands
  const formattedBrands = brands.data.map((brand) => ({
    id: brand.id,
    label: brand.brand_name,
    value: brand.brand_name,
  }));

  const teamsApi = new TeamsClientController();
  const teams = await teamsApi.getAll();
  const formattedTeams: SelectOptions[] = teams.data.map((team) => ({
    id: team.id,
    label: team.team_name,
    value: String(team.id),
  }));

  const usersApi = new UserClientController();
  const userTypes = await usersApi.getUserTypes();
  const formattedUserTypes: SelectOptions[] = userTypes.data.map((type) => ({
    id: type.id,
    label: type.user_type_name,
    value: String(type.id),
  }));

  const menusApi = new MenusClientController();
  const mainMenus = await menusApi.getAllMainMenus();
  const formattedMainMenus: MainMenuSelectOptions[] = mainMenus.data.map(
    (main) => ({
      id: main.id,
      label: main.title,
      sort: main.sort_number,
      value: String(main.id),
    })
  );
  const subMenus = await menusApi.getAllSubMenus();
  const formattedSubMenus: SubMenuSelectOptions[] = subMenus.data.map(
    (sub) => ({
      id: sub.id,
      label: sub.title,
      main_menu_id: String(sub.main_menu_id),
      sort: sub.sort_number,
      value: String(sub.id),
    })
  );

  const menuSelectOptions: MenuSelectOptions = {
    main_menu: formattedMainMenus,
    sub_menu: formattedSubMenus,
  };

  const userSelectOptions: UserSelectOptions = {
    teams: formattedTeams,
    user_types: formattedUserTypes,
  };

  return (
    <UserAccessContainer
      brands={formattedBrands}
      menuSelectOptions={menuSelectOptions}
      userSelectOptions={userSelectOptions}
      searchParams={params}
    />
  );
}
