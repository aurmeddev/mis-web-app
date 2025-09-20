SELECT
b.id, b.brand_name, b.site,
b.site_platform_id,
CASE
  WHEN sp.id IS NULL THEN JSON_OBJECT()
  ELSE JSON_OBJECT('id', sp.id, 'platform', sp.platform, 'created_at', sp.created_at)
END AS site_platform,
b.group_id,
b.created_at,
IF(b.is_active=1,"active","inactive") AS status
FROM `Brands` AS b
INNER JOIN `Site_Platforms` AS sp
ON b.site_platform_id=sp.id;