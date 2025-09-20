SELECT id,geo_name,geo_abbrev,created_at, 
IF(is_active=1,"active","inactive") AS status 
FROM `Geos`