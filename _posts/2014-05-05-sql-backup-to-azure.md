---
layout: post
title: "Microsoft SQL Server backup to Azure"
tags: [tsql,sql,sqlserver,backup,azure,blobs,recoverymodel,simple,full]
---

We have been running a Microsoft SQL Server 2012 scheduled backup to Azure Storage Blobs for a couple of weeks. We have Microsoft SQL Server 2012 running on a Azure VM so it was logical to run our backup within Azure. SQL 2012 supports Azure blob storage but not in its Microsoft SQL Server Management Studio. You need to run the BACKUP statement and there is a good article on technet explaining this

SQL Server Backup and Restore with Windows Azure Blob Storage Service
http://technet.microsoft.com/en-us/library/jj919148.aspx

Mickaël MOTTET provides a tsql example in the comments that iterates through the available databases and runs the backup statement in a cursor. I used his example to create two stored procedures. One that does a regular backup  (BACKUP DATABASE) and a log backup (BACKUP LOG DATABASE).

Backup log database errors by incorrect recovery model
---

This was al running fine for weeks but then I got log backup errors. We added a new database and its recovery model was set to 'simple'. The solution was simple by setting the recovery model to 'full'. Now the log backup was working again for all databases.

Full recovery model not always needed
---

Except, there are lots of scenarios where you might not need the full recovery model as it also creates heavy load on your log files when you have a database that has a lot of writes while the data isn't that important. Azure virtual machine disk IO isn't that awesome at the moment (max 500IOPS/s).

Mickaël MOTTET queried master.dbo.sysdatabases as to get a list of all databases:

	SELECT name 
	FROM master.dbo.sysdatabases
	WHERE dbid > 4


This table does not contain the configured recovery model for the database. I changed his query to use another system database and query for the right recovery model:
	
	SELECT name
	FROM master.sys.databases DB
	WHERE database_id > 4 and recovery_model=1

	
Now both the BACKUP DATABASE and BACKUP LOG DATABASE are working again.

Here are the stored procedures that perform the backups. Both stored procedures are run from two scheduled jobs. I hope this helps a few :)


Database backup stored procedure
---

	CREATE PROCEDURE [dbo].[stp_backuptoazure]
	(
		@storageAccount VARCHAR(255),
		@storageCatalog VARCHAR(255)
	)
	AS BEGIN

		DECLARE @credential VARCHAR(100) = @storageAccount + 'credential';
		DECLARE @storage VARCHAR(255) = 'https://' + @storageAccount + '.blob.core.windows.net/' + @storageCatalog+ '/';

		DECLARE @timestamp as varchar(50)
		SET @timestamp = REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(40), GETUTCDATE(), 120),'-','_'),':','_'),' ','_');


		DECLARE @filename VARCHAR(255);
		DECLARE @databasename VARCHAR(50);
		DECLARE db_cursor CURSOR FOR  

		SELECT name 
		FROM master.dbo.sysdatabases
		WHERE dbid > 4
		ORDER BY name ASC; -- only users databases
	 
		OPEN db_cursor   
		FETCH NEXT FROM db_cursor INTO @databasename;   
	 
		WHILE @@FETCH_STATUS = 0   
		BEGIN   
	 
		 SET @filename = @storage + @databasename + '.' + @timestamp + '.bak';

		 BACKUP DATABASE @databasename
		 TO URL = @filename
		 WITH CREDENTIAL = @credential, COMPRESSION, FORMAT;

		 FETCH NEXT FROM db_cursor INTO @databasename;
		END   
	 
		CLOSE db_cursor;
		DEALLOCATE db_cursor;

	END

Database log backup stored procedure
---

	CREATE PROCEDURE [dbo].[stp_backuptoazure_log]
	(
		@storageAccount VARCHAR(255),
		@storageCatalog VARCHAR(255)
	)
	AS BEGIN

		DECLARE @credential VARCHAR(100) = @storageAccount + 'credential';
		DECLARE @storage VARCHAR(255) = 'https://' + @storageAccount + '.blob.core.windows.net/' + @storageCatalog+ '/';

		DECLARE @timestamp as varchar(50)
		SET @timestamp = REPLACE(REPLACE(REPLACE(CONVERT(VARCHAR(40), GETUTCDATE(), 120),'-','_'),':','_'),' ','_');


		DECLARE @filename VARCHAR(255);
		DECLARE @databasename VARCHAR(50);
		DECLARE db_cursor CURSOR FOR  

		SELECT name
		FROM master.sys.databases DB
		WHERE database_id > 4 and recovery_model=1
		ORDER BY name ASC; -- only users databases with recovery model full
	 
		OPEN db_cursor   
		FETCH NEXT FROM db_cursor INTO @databasename;   
	 
		WHILE @@FETCH_STATUS = 0   
		BEGIN   
	 
		 SET @filename = @storage + @databasename + '.' + @timestamp + '.trn';

		 BACKUP LOG  @databasename
		 TO URL = @filename
		 WITH CREDENTIAL = @credential, COMPRESSION, FORMAT;

		 FETCH NEXT FROM db_cursor INTO @databasename;
		END   
	 
		CLOSE db_cursor;
		DEALLOCATE db_cursor;

	END



