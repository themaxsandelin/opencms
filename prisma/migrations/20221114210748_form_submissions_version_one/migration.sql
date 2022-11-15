BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[FormVersionSubmissions] (
    [id] NVARCHAR(1000) NOT NULL,
    [data] NVARCHAR(max) NOT NULL,
    [localeCode] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmissions_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionSubmissions_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FormVersionSubmissions_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmissions] ADD CONSTRAINT [FormVersionSubmissions_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionSubmissions] ADD CONSTRAINT [FormVersionSubmissions_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[FormVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
