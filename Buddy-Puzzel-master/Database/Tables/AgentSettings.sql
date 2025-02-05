CREATE TABLE [dbo].[AgentSettings]
(
	[UserId] INT NOT NULL , 
    [CustomerKey] INT NOT NULL, 
    [SettingId] INT NOT NULL, 
    [SettingValue] VARCHAR(1000) NULL, 
    [LastUpdated] DATETIME NULL, 
    PRIMARY KEY ([UserId], [CustomerKey], [SettingId]), 
    CONSTRAINT [FK_AgentSettings_SettingIds] FOREIGN KEY ([SettingId]) REFERENCES [SettingIds]([SettingId])
)
