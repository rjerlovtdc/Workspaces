DELETE FROM SettingIds
GO

INSERT INTO SettingIds ([SettingId], [SettingName], [SettingDescription], [HtmlId], [ValueType], [SettingGroup])
VALUES
(1, 'ActivateTab', 'Activate NdBuddy widget on incoming call', 'settingTabChk', 'bool', 'Calling'),
(10, 'ShowDepartmentTop', 'Show departments first in search results', 'settingDepartmentChk', 'bool', 'Phonebook'),
(100, 'FavoritesQueues', 'Favorites Queues', '', 'string[]', 'Phonebook'),
(101, 'FavoritesEmployees', 'Favorites Employees', '', 'string[]', 'Phonebook')