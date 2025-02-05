CREATE PROCEDURE [dbo].InsertPresenceMobile
	@customerId INT,
	@type VARCHAR(50),
	@domain VARCHAR(50),
	@subDomain VARCHAR(50) = 'DEFAULT',
	@tdcNotes TEXT = '',
	@cryptoString VARCHAR(50)
AS

BEGIN  
  SET NOCOUNT ON;
      INSERT INTO [MobilePresence]([CustomerId_FK], [Type], Domain, TdcNotes, CryptoString)
	  VALUES (@customerId, @type, @domain, @tdcNotes, @cryptoString)  
END