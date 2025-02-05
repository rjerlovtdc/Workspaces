CREATE PROCEDURE [dbo].GetAgentLogins
	@customerKey INT = 0,
	@loginDateTime DATETIME = '1900-01-01 00:00:00'
AS

BEGIN
	IF (@customerKey != 0)
	BEGIN
		IF (@loginDateTime = '1900-01-01 00:00:00')
		BEGIN
			SELECT [CustomerKey], [CustomerId], [UserGroupId], [UserId], [LanguageId], [LanguageCode],[LoginDateTime] 
			FROM AgentLogins
			WHERE [CustomerKey] = @customerKey
		END
		ELSE
			BEGIN
				SELECT [CustomerKey], [CustomerId], [UserGroupId], [UserId], [LanguageId], [LanguageCode],[LoginDateTime] 
				FROM AgentLogins
				WHERE [CustomerKey] = @customerKey AND LoginDateTime >= @loginDateTime
			END
	END
	ELSE

	IF (@customerKey = 0)
	IF (@loginDateTime = '1900-01-01 00:00:00')
		BEGIN
			SELECT [CustomerKey], [CustomerId], [UserGroupId], [UserId], [LanguageId], [LanguageCode],[LoginDateTime] 
			FROM AgentLogins
		END
		ELSE
			BEGIN
				SELECT [CustomerKey], [CustomerId], [UserGroupId], [UserId], [LanguageId], [LanguageCode],[LoginDateTime] 
				FROM AgentLogins
				WHERE LoginDateTime >= @loginDateTime
			END
END