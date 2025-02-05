CREATE TABLE [dbo].[AgentLogins]
(
    [CustomerKey] INT NOT NULL, 
    [CustomerId] INT NOT NULL, 
    [UserGroupId] INT NULL, 
    [UserId] INT NOT NULL, 
    [LanguageId] INT NULL, 
    [LanguageCode] VARCHAR(50) NULL, 
    [LoginDateTime] DATETIME NULL,
    [Id] INT NOT NULL PRIMARY KEY IDENTITY
)

GO

CREATE INDEX [IX_AgentLogins_UserId] ON [dbo].[AgentLogins] ([UserId])

GO

CREATE INDEX [IX_AgentLogins_CustomerKey] ON [dbo].[AgentLogins] ([CustomerKey])
