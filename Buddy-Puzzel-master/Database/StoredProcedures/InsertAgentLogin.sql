CREATE PROCEDURE [dbo].[InsertAgentLogin]
	@customerKey INT,
	@customerId INT,
	@userGroupId INT,
	@userId INT,
	@languageId INT,
	@languageCode VARCHAR(50),
    @loginDateTime DATETIME
AS

BEGIN  
  SET NOCOUNT ON;
      INSERT INTO AgentLogins(CustomerKey, CustomerId, UserGroupId, UserId, LanguageId, LanguageCode, LoginDateTime)
	  VALUES (@customerKey, @customerId, @userGroupId, @userId, @languageId, @languageCode, @loginDateTime)  
END  