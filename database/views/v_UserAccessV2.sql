-- Aggregate Sub-Menus into JSON (Grouped by Main Menu)
WITH SubMenuJSON AS (
    SELECT
        sub_access.user_id,
        sub_access.main_menu_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', sub_menu.id,
                'title', sub_menu.title,
                'sort_number', sub_menu.sort_number,
                'url', sub_menu.url
            )
        ) AS items_json
    FROM `User_Access_Sub_Menus` AS sub_access
    INNER JOIN `Sub_Menus` AS sub_menu ON sub_access.sub_menu_id = sub_menu.id
    WHERE sub_access.is_active = 1 AND sub_menu.is_active = 1
    GROUP BY sub_access.user_id, sub_access.main_menu_id
),
-- Aggregate Main Menus and Nest Sub-Menus (Grouped by User)
MainMenuJSON AS (
    SELECT
        main_access.user_id,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', main_menu.id,
                'title', main_menu.title,
                'url', main_menu.url,
                'icon', main_menu.icon,
                'sort_number', main_menu.sort_number,
                'items', COALESCE(smj.items_json, JSON_ARRAY()) -- Nest the pre-aggregated sub-menus
            )
        ) AS navMain
    FROM `User_Access_Main_Menus` AS main_access
    INNER JOIN `Main_Menus` AS main_menu 
    ON main_menu.id = main_access.main_menu_id
    LEFT JOIN SubMenuJSON smj 
    ON smj.user_id = main_access.user_id
    AND smj.main_menu_id = main_access.main_menu_id
    WHERE main_access.is_active = 1 AND main_menu.is_active = 1
    GROUP BY main_access.user_id
),
UserAccessBrandsJSON AS(
	SELECT
    uab.user_id,
    JSON_ARRAYAGG(
		JSON_OBJECT(
            'id',uab.id,
            'brand_id',uab.brand_id,
            'brand_name',b.brand_name,
        	'status',IF(uab.is_active = 1, 'active', 'inactive')
        )
    ) AS assigned_brands
    FROM `User_Access_Brands` AS uab
    INNER JOIN `Brands` AS b 
    ON b.id=uab.brand_id
    GROUP BY uab.user_id
)
-- Final Query (Joining the pre-aggregated JSON)
SELECT
    u.id,
    u.full_name,
    COALESCE(u.display_name, u.full_name) AS display_name,
    u.email,
    u.password,
    u.is_active,
    IF(u.is_active = 1, 'active', 'inactive') AS status,
    u.avatar,
    gt.gender,
    u.user_type_id,
    ut.user_type_name,
    u.team_id,
    t.team_name,
    COALESCE(uabj.assigned_brands, JSON_ARRAY()) AS assigned_brands,
    COALESCE(mj.navMain, JSON_ARRAY()) AS navMain
FROM `Users` AS u
LEFT JOIN MainMenuJSON AS mj 
ON mj.user_id = u.id
LEFT JOIN UserAccessBrandsJSON AS uabj
ON uabj.user_id = u.id
INNER JOIN `User_Types` AS ut 
ON u.user_type_id = ut.id
INNER JOIN `Teams` AS t 
ON u.team_id = t.id
INNER JOIN `Gender_Types` AS gt 
ON u.gender_type_id = gt.id;