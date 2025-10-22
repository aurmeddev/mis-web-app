WITH DistinctRecruiters AS (
    SELECT DISTINCT(recruited_by) AS recruited_by FROM `Fb_Accounts` 
)
SELECT u.id, u.full_name, u.display_name FROM `Users` AS u 
INNER JOIN DistinctRecruiters AS dr
ON dr.recruited_by=u.id;