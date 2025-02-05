CREATE PROCEDURE [dbo].[InsertCustomer]
	@ustomerName VARCHAR(50),
	@customerKey INT,
	@customerId INT,
	@ustomerInfo VARCHAR(1024) = '',
	@status VARCHAR(50) = 'ACTIVE',
	@license VARCHAR(50) = 'TdcAll'
AS

BEGIN  
  SET NOCOUNT ON;
      INSERT INTO Customers(CustomerName, CustomerKey, CustomerId, CustomerInfo, CustomerStatus, CustomerLicense)
	  VALUES (@ustomerName, @customerKey, @customerId, @ustomerInfo, @status, @license)  
END