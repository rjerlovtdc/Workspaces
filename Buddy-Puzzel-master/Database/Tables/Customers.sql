CREATE TABLE [dbo].[Customers]
(
	[CustomerName] VARCHAR(50) NOT NULL, 
    [CustomerKey] INT NOT NULL, 
    [CustomerId] INT NOT NULL PRIMARY KEY, 
    [CustomerInfo] VARCHAR(1024) DEFAULT '', 
    [CustomerStatus] VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', 
    [CustomerLicense] VARCHAR(50) NOT NULL DEFAULT 'TdcAll'
)
