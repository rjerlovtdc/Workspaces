CREATE PROCEDURE [dbo].[GetAgentSettings]
	@userId INT,
	@customerKey INT
AS

BEGIN
	SELECT [SettingId], [SettingValue]
	FROM AgentSettings
	WHERE UserId = @userId AND CustomerKey = @customerKey
END
