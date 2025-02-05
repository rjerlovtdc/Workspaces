CREATE TABLE [dbo].[SettingIds]
(
	[SettingId] INT NOT NULL PRIMARY KEY, 
    [SettingName] VARCHAR(50) NOT NULL, 
    [SettingDescription] VARCHAR(255) NULL, 
    [HtmlId] VARCHAR(50) NULL,
    [ValueType] VARCHAR(50) NULL,
    [SettingGroup] VARCHAR(50) NULL
)
