CREATE PROCEDURE [dbo].[InsertUpdateAgentSetting]
	@userId INT,
	@customerKey INT,
	@settingId INT,
	@settingValue VARCHAR(1000),
    @lastUpdated DATETIME
AS

BEGIN  
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT UserId
    FROM AgentSettings
    WHERE (UserId = @userId AND CustomerKey = @customerKey AND SettingId = @settingId)
  )
  BEGIN
    UPDATE AgentSettings
    SET SettingValue =  @settingValue, LastUpdated = @lastUpdated
    WHERE (UserId = @userId AND CustomerKey = @customerKey AND SettingId = @settingId)
  END
    ELSE
    BEGIN
      INSERT INTO AgentSettings(UserId, CustomerKey, SettingId, SettingValue, LastUpdated)  
      VALUES (@userId, @customerKey, @settingId, @settingValue, @lastUpdated)  
    END
END  