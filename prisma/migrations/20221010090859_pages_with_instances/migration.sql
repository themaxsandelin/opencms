/*
  Warnings:

  - You are about to drop the column `path` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Page` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Page` table. All the data in the column will be lost.
  - Added the required column `name` to the `Page` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Page] DROP COLUMN [path],
[slug],
[title];
ALTER TABLE [dbo].[Page] ADD [isFrontPage] BIT NOT NULL CONSTRAINT [Page_isFrontPage_df] DEFAULT 0,
[name] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[PageInstance] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [slug] NVARCHAR(1000) NOT NULL,
    [path] NVARCHAR(1000) NOT NULL,
    [localeCode] NVARCHAR(1000) NOT NULL,
    [pageId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PageInstance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [PageInstance_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PageInstance_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PageInstance] ADD CONSTRAINT [PageInstance_pageId_fkey] FOREIGN KEY ([pageId]) REFERENCES [dbo].[Page]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
