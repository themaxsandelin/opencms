# Open CMS
An open source CMS.

## Database
The CMS uses Microsoft SQL Server with Prisma as it's ORM. To make sure Prisma runs, you'll have to create an `.env` file in the root of the project, and make sure that you set the variable `DATABASE_URL` is set. You can check out the [Prisma docs on connection urls](https://www.prisma.io/docs/reference/database-reference/connection-urls) to see how you can format the string correctly.

### Local development
To run a MSSQL database locally you can use Docker. Make sure you have Docker installed on your machine and run the following command to start a container with MSSQL running on it:
```bash
docker run -d --name sql_server -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=SomeThingComplicated1234' -p 1433:1433 mcr.microsoft.com/azure-sql-edge:latest
```

### Using prisma
When running the api locally and you want to synchronise your database with the Prisma schema, simply run the following command:
```bash
npx prisma db seed
```
