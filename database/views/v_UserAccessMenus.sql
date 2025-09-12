SELECT main.user_id, main.main_menu_id, IF(main.is_active=1,"active","inactive") As main_menu_status,
sub.sub_menu_id, IF(sub.is_active=1,"active","inactive") AS sub_menu_status
FROM `User_Access_Main_Menus` AS main 
INNER JOIN `User_Access_Sub_Menus` AS sub 
ON main.user_id=sub.user_id AND main.main_menu_id=sub.main_menu_id 
