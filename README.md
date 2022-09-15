# Open CMS
An open source CMS.

## Database
The CMS uses Microsoft SQL Server with Prisma as it's ORM. To run a MSSQL database locally you can use Docker. Make sure you have Docker installed on your machine and run the following command to start a container with MSSQL running on it:
```bash
docker run -d --name sql_server -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=SomeThingComplicated1234' -p 1433:1433 mcr.microsoft.com/azure-sql-edge:latest
```
