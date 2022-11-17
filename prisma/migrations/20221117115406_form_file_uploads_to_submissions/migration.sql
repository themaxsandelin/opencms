/*
  Warnings:

  - You are about to drop the `FormVersionSubmissions` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[FormVersionSubmissions] DROP CONSTRAINT [FormVersionSubmissions_environmentId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[FormVersionSubmissions] DROP CONSTRAINT [FormVersionSubmissions_siteId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[FormVersionSubmissions] DROP CONSTRAINT [FormVersionSubmissions_versionId_fkey];

-- DropTable
DROP TABLE [dbo].[FormVersionSubmissions];

-- CreateTable
CREATE TABLE [dbo].[FormVersionSubmission] (
    [id] NVARCHAR(1000) NOT NULL,
    [data] NVARCHAR(max) NOT NULL,
    [localeCode] NVARCHAR(1000) NOT NULL,
    [siteId] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmission_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FormVersionSubmission_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FormVersionSubmissionFile] (
    [id] NVARCHAR(1000) NOT NULL,
    [submissionId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmissionFile_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmissionFile_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FormVersionSubmissionFile_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmission] ADD CONSTRAINT [FormVersionSubmission_siteId_fkey] FOREIGN KEY ([siteId]) REFERENCES [dbo].[Site]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmission] ADD CONSTRAINT [FormVersionSubmission_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmission] ADD CONSTRAINT [FormVersionSubmission_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[FormVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmissionFile] ADD CONSTRAINT [FormVersionSubmissionFile_submissionId_fkey] FOREIGN KEY ([submissionId]) REFERENCES [dbo].[FormVersionSubmission]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
