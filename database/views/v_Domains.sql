SELECT d.id, d.domain_name, 
IF(d.is_active=1,'active', 'inactive') AS status, d.created_at,
CASE
    WHEN u.id IS NULL THEN JSON_OBJECT()
    ELSE JSON_OBJECT('id', u.id, 'full_name', u.full_name, 'team_name', t.team_name)
END AS created_by
FROM `Domains` AS d
INNER JOIN `Users` AS u 
ON d.created_by=u.id
INNER JOIN `Teams`AS t
ON u.team_id=t.id;