BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[FormVersion] ADD [wasPublished] BIT NOT NULL CONSTRAINT [FormVersion_wasPublished_df] DEFAULT 0;

-- CreateTable
CREATE TABLE [dbo].[FormVersionPublication] (
    [id] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionPublication_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionPublication_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FormVersionPublication_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionPublication] ADD CONSTRAINT [FormVersionPublication_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[FormVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionPublication] ADD CONSTRAINT [FormVersionPublication_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
