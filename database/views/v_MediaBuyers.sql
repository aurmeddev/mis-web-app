SELECT id, name, created_at,
IF(is_active=1,"active","inactive") AS status 
FROM `Media_Buyers`;