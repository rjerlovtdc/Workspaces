CREATE PROCEDURE [dbo].[TdcExportToPuzzel]
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
		[RowColor] VARCHAR(50),
		ImportSource VARCHAR(50)
	)

	/* Basic Info */
	BEGIN
		INSERT INTO #tdcTmpPuzzel (External_catalog_ID, First_name, Last_name, Title, Department, Email,
									Phone, Mobile_phone, Fax, [Description], [Services], RowColor, ImportSource)
		
		SELECT AccountName + '@rsyd.dk' AS 'External_catalog_ID',
			REPLACE(ISNULL(FirstName, ''), '-', '') AS 'First_name',
			REPLACE(ISNULL(LastName, ''), '-', '') AS 'Last_name', 
			ISNULL(Title, '') AS 'Title', 
			ISNULL(Department, '') AS 'Department',
			ISNULL(EmailAddress, '') AS 'Email',
		CASE
			WHEN (ISNULL(PhoneNumber, '') = '' AND ISNULL(MobileNumber, '') = '') THEN HomePhoneNumber
			ELSE PhoneNumber
		END AS 'Phone',
		ISNULL(MobileNumber, '') AS 'Mobile_phone', 
		'00000000' AS 'Fax',
		ISNULL(replace(Notes,CHAR(13), '\n') ,'') + ' | ' + ISNULL(Misc2, '') AS 'Description',
		'|' + ISNULL(Misc4, '') + '|' + ISNULL(Misc3, '') + '|' + ISNULL([Address] + ', ' + PostCode + ' ' + City, '') + '|||' +
		ISNULL(Company, '') + ',' + ISNULL(Division, '') + ',' + ISNULL(Department, '') + ',' + ISNULL(EmployeeId, '') + '|' + 
		ISNULL(RowColor, '') + '|' + ISNULL(AltFaxNumber, '') + '|' + ISNULL(RoomNumber, '') + '|' + ISNULL(IpPhone, '') AS 'Services',
		RowColor,
		ImportSource
	
		FROM UserAdmin_DirectoryEmployee
		WHERE (GCRecord IS NULL AND ISNULL(AccountName, '') <> '') AND 
			(ISNULL(PhoneNumber, '') <> '' OR ISNULL(MobileNumber, '') <> '' OR ISNULL(HomePhoneNumber, '') <> '')
		ORDER BY External_catalog_ID
	END

	/* Remove +45 from PhoneNumbers  */
	BEGIN
		UPDATE #tdcTmpPuzzel  SET Phone = RIGHT(Phone, 8)  WHERE LEN(Phone) > 10 AND SUBSTRING(Phone, 1, 3) = '+45'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = RIGHT(Mobile_phone, 8)  WHERE LEN(Mobile_phone) > 10 AND SUBSTRING(Mobile_phone, 1, 3) = '+45'
	END

	/* Prefix - 8 digits  */
	BEGIN
		/* Prefix AMK/LV */
		UPDATE #tdcTmpPuzzel  SET Phone = '764' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 3) = '397'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '764' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 3) = '397'
	
		/* Prefix OUH (Odense) */
		UPDATE #tdcTmpPuzzel  SET Phone = '654' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '1'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '654' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '1'

		/* Prefix OUH (Svendbord) */
		UPDATE #tdcTmpPuzzel  SET Phone = '6320' + RIGHT(Phone, 4)  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 2) = '21'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '6320' + RIGHT(Mobile_phone, 4)  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 2) = '21'
		UPDATE #tdcTmpPuzzel  SET Phone = '6320' + RIGHT(Phone, 4)  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 2) = '22'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '6320' + RIGHT(Mobile_phone, 4)  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 2) = '22'
		
		UPDATE #tdcTmpPuzzel  SET Phone = '654' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '22'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '654' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '2'

		/* Prefix Regionshuset */
		UPDATE #tdcTmpPuzzel  SET Phone = '766' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '3'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '766' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '3'
	
		/* Prefix Psyk og Satellitter */
		UPDATE #tdcTmpPuzzel  SET Phone = '994' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '4'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '994' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '4'

		/* Prefix SLB (Kolding) */
		UPDATE #tdcTmpPuzzel  SET Phone = '763' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '6'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '763' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '6'

		/* Prefix SHS (Aabenraa) */
		UPDATE #tdcTmpPuzzel  SET Phone = '799' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '7'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '799' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '7'

		/* Prefix SHS (Esbjerg) */
		UPDATE #tdcTmpPuzzel  SET Phone = '791' + Phone  WHERE LEN(Phone) = 5 AND SUBSTRING(Phone, 1, 1) = '8'
		UPDATE #tdcTmpPuzzel  SET Mobile_phone = '791' + Mobile_phone  WHERE LEN(Mobile_phone) = 5 AND SUBSTRING(Mobile_phone, 1, 1) = '8'
	END

	/* FaxNumber from RowColor */
	BEGIN
	UPDATE #tdcTmpPuzzel SET Fax = '00000000' WHERE RowColor = 'White'
		UPDATE #tdcTmpPuzzel SET Fax = '00010000' WHERE RowColor = 'Gray'
		UPDATE #tdcTmpPuzzel SET Fax = '00020000' WHERE RowColor = 'Green'
		UPDATE #tdcTmpPuzzel SET Fax = '00030000' WHERE RowColor = 'Orange'
		UPDATE #tdcTmpPuzzel SET Fax = '00040000' WHERE RowColor = 'Turquoise'
		UPDATE #tdcTmpPuzzel SET Fax = '00050000' WHERE RowColor = 'Plum'
		UPDATE #tdcTmpPuzzel SET Fax = '00060000' WHERE RowColor = 'Yellow'
		UPDATE #tdcTmpPuzzel SET Fax = '00070000' WHERE RowColor = 'CornflowerBlue'
		UPDATE #tdcTmpPuzzel SET Fax = '00080000' WHERE RowColor = 'Red'
		UPDATE #tdcTmpPuzzel SET Fax = '00090000' WHERE RowColor = 'Wheat'

		UPDATE #tdcTmpPuzzel SET Fax = '00070000' WHERE RowColor = '128, 128, 255'
		UPDATE #tdcTmpPuzzel SET Fax = '00070000' WHERE RowColor = '128; 128; 255'
		UPDATE #tdcTmpPuzzel SET Fax = '00040000' WHERE RowColor = '192, 255, 255'
		UPDATE #tdcTmpPuzzel SET Fax = '00030000' WHERE RowColor = '255, 128, 0'
		UPDATE #tdcTmpPuzzel SET Fax = '00030000' WHERE RowColor = '255; 128; 0'
		UPDATE #tdcTmpPuzzel SET Fax = '00090000' WHERE RowColor = '255, 224, 192'
		UPDATE #tdcTmpPuzzel SET Fax = '00060000' WHERE RowColor = '255, 255, 0'
		UPDATE #tdcTmpPuzzel SET Fax = '00090000' WHERE RowColor = 'Beige'
		UPDATE #tdcTmpPuzzel SET Fax = '00070000' WHERE RowColor = 'Blue'
		UPDATE #tdcTmpPuzzel SET Fax = '00090000' WHERE RowColor = 'BurlyWood'
		UPDATE #tdcTmpPuzzel SET Fax = '00020000' WHERE RowColor = 'Lime'
		UPDATE #tdcTmpPuzzel SET Fax = '00090000' WHERE RowColor = 'DarkKhaki'
	END

	IF (@importSource = '')
	BEGIN
		SELECT	 External_catalog_ID, First_name, Last_name, Title, Department, Email,
					Phone, Mobile_phone, Fax, [Description], [Services]
		FROM #tdcTmpPuzzel
		ORDER BY External_catalog_ID
	END
		ELSE
			BEGIN
				SELECT	 External_catalog_ID, First_name, Last_name, Title, Department, Email,
							Phone, Mobile_phone, Fax, [Description], [Services]
				FROM #tdcTmpPuzzel
				WHERE ImportSource = @importSource
				ORDER BY External_catalog_ID
			END
	
	DROP TABLE IF EXISTS dbo.#tdcTmpPuzzel
END