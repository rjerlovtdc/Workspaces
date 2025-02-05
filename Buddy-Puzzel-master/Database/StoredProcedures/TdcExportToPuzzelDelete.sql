CREATE PROCEDURE [dbo].[TdcExportToPuzzelDelete]
	@importSource VARCHAR(50) = ''

AS
BEGIN
	SET NOCOUNT ON;

	DROP TABLE IF EXISTS dbo.#tdcTmpPuzzel

	CREATE TABLE #tdcTmpPuzzel
	(
		Id int identity(1,1) primary key clustered,
		External_catalog_ID VARCHAR(255),
		First_name VARCHAR(255),
		Last_name VARCHAR(255),
		Title VARCHAR(255),
		Department VARCHAR(255),
		Email VARCHAR(255),
		Phone VARCHAR(50),
		Mobile_phone VARCHAR(50),
		Fax VARCHAR(50),
		[Description] VARCHAR(4096),
		[Services] VARCHAR(1024),
		ImportSource VARCHAR(50)
	)

	/* Basic Info */
	BEGIN
		INSERT INTO #tdcTmpPuzzel (External_catalog_ID, First_name, Last_name, Title, Department, Email,
									Phone, Mobile_phone, Fax, [Description], [Services], ImportSource)
		
		SELECT AccountName + '@rsyd.dk' AS 'External_catalog_ID',
			ISNULL(FirstName, '') AS 'First_name',
			ISNULL(LastName, '') AS 'Last_name', 
			ISNULL(Title, '') AS 'Title', 
			ISNULL(Department, '') AS 'Department',
			ISNULL(EmailAddress, '') AS 'Email',
		CASE
			WHEN (ISNULL(PhoneNumber, '') = '' AND ISNULL(MobileNumber, '') = '') THEN ISNULL(HomePhoneNumber, '')
			ELSE ISNULL(PhoneNumber, '')
		END AS 'Phone',
		ISNULL(MobileNumber, '') AS 'Mobile_phone', 
		ISNULL(FaxNumber, '') AS 'Fax',
		'' AS 'Description',
		'' AS 'Services',
		ImportSource
	
		FROM UserAdmin_DirectoryEmployee
		WHERE (GCRecord IS NOT NULL AND ISNULL(AccountName, '') <> '')
		ORDER BY External_catalog_ID
	END

	IF (@importSource = '')
	BEGIN
		SELECT	 External_catalog_ID, First_name, Last_name, Title, Department, Email,
					Phone, Mobile_phone, Fax, [Description], [Services], 'YES' AS 'Delete'
		FROM #tdcTmpPuzzel
		ORDER BY External_catalog_ID
	END
		ELSE
			BEGIN
				SELECT	 External_catalog_ID, First_name, Last_name, Title, Department, Email,
							Phone, Mobile_phone, Fax, [Description], [Services], 'YES' AS 'Delete'
				FROM #tdcTmpPuzzel
				WHERE ImportSource = @importSource
				ORDER BY External_catalog_ID
			END
	
	DROP TABLE IF EXISTS dbo.#tdcTmpPuzzel
END