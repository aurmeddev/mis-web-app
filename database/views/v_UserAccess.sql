SELECT
u.id, u.full_name, 
u.display_name, u.email, u.password, u.is_active, u.avatar,
gt.gender, u.user_type_id, ut.user_type_name, u.team_id, t.team_name,
COALESCE((
    SELECT JSON_ARRAYAGG(
             JSON_OBJECT(
               'id', main_menu.id,
               'title', main_menu.title,
               'url', main_menu.url,
               'sort_number',main_menu.sort_number,
               'items', COALESCE((
    					SELECT JSON_ARRAYAGG(
             					JSON_OBJECT(
               						'id', sub_menu.id,
               						'title', sub_menu.title,
                          'sort_number',sub_menu.sort_number,
               						'url', sub_menu.url
             							)
           							)
    									FROM `User_Access_Sub_Menus` AS sub_access
    									INNER JOIN `Sub_Menus` AS sub_menu ON sub_access.sub_menu_id = sub_menu.id
    									WHERE sub_access.main_menu_id = main_access.main_menu_id AND sub_access.is_active = 1
                      AND sub_menu.is_active = 1
    									ORDER BY sub_menu.sort_number
  									), JSON_ARRAY())
             )
           )
    FROM `User_Access_Main_Menus` AS main_access
    INNER JOIN `Main_Menus` AS main_menu ON main_menu.id = main_access.main_menu_id
    WHERE main_access.user_id = u.id AND main_access.is_active = 1
    AND main_menu.is_active = 1
    ORDER BY main_menu.sort_number
  ), JSON_ARRAY()) AS navMain
FROM `Users` AS u
INNER JOIN `User_Types` AS ut 
ON u.user_type_id=ut.id
INNER JOIN `Teams` AS t 
ON u.team_id=t.id
INNER JOIN `Gender_Types` AS gt
ON u.gender_type_id=gt.id;