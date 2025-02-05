CREATE TABLE [dbo].[MobilePresence]
(
    [CustomerId_FK] INT NOT NULL  PRIMARY KEY,
    [Type] VARCHAR(50) NOT NULL DEFAULT 'TdcScale', 
    [Domain] VARCHAR(50) NOT NULL,
    [SubDomain] VARCHAR(50) NOT NULL DEFAULT 'DEFAULT',
    [TdcNotes] TEXT NULL DEFAULT '', 
    [CryptoString] VARCHAR(255) NOT NULL, 
    CONSTRAINT [FK_MobilePresence_Customers] FOREIGN KEY (CustomerId_FK) REFERENCES [Customers](CustomerId)
)
