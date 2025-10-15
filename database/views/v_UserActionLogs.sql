SELECT u.full_name, ul.description AS search_keyword, lt.log_type_name, ul.created_at FROM `User_Logs` AS ul
INNER JOIN `Users` AS u
ON ul.created_by=u.id
INNER JOIN `Log_Types` AS lt
ON ul.log_type_id=lt.id
ORDER BY created_at DESC;