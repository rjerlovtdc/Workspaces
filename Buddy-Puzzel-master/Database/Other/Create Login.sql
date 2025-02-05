-- create SQL login in master database
CREATE LOGIN ndbuddy
WITH PASSWORD = '8#s9F8p@pyH&';


-- add database user for login testLogin1
CREATE USER ndbuddy
FROM LOGIN ndbuddy
WITH DEFAULT_SCHEMA=dbo;


-- add user to database role(s) (i.e. db_owner)
ALTER ROLE db_owner ADD MEMBER ndbuddy;