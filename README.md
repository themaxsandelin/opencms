# Open CMS
An open source CMS.

## File uploads
The CMS has support for uploading files when submitting forms. This feature requires some kind of file storage to be mounted and accessible by the app. The app expects a folder to exist and be defined in an environment variable called `UPLOAD_DIR`, as the full path to that folder. Inside the folder, there also has to be two sub folders, one for the temporary uploads, and one for the long term storage of files for each form submission. These folders need to be named `/uploads` and `/submissions` respectively. With that in place, you're all set.

## Database
The CMS uses Microsoft SQL Server with Prisma as it's ORM. To make sure Prisma runs, you'll have to create an `.env` file in the root of the project, and make sure that you set the variable `DATABASE_URL` is set. You can check out the [Prisma docs on connection urls](https://www.prisma.io/docs/reference/database-reference/connection-urls) to see how you can format the string correctly.

### Local development
To run a MSSQL database locally you can use Docker. Make sure you have Docker installed on your machine and run the following command to start a container with MSSQL running on it:
```bash
docker run -d --name sql_server -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourCompliacetdPassword123' -p 1433:1433 mcr.microsoft.com/azure-sql-edge:latest
```

### Using prisma
When running the api locally and you want to set up your database with the Prisma schema, simply run the following command:
```bash
pnpm prisma db push
```

## Apps & services
The project uses [nx](https://nx.dev/) as a monorepo tool to manage all services and code in the project. You can refer to their [documentation](https://nx.dev/core-features) for any actions you'd like to take on the project overall.

But as an example, to run any of the apps, you use the `nx serve` command. So, to run the content-api, you use the command like this:
```bash
pnpm nx serve content-api
```
