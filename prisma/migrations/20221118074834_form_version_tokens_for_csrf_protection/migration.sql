BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[FormVersionToken] (
    [id] NVARCHAR(1000) NOT NULL,
    [localeCode] NVARCHAR(1000) NOT NULL,
    [expiresAt] DATETIME2 NOT NULL,
    [siteId] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionToken_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [FormVersionToken_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FormVersionToken_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionToken] ADD CONSTRAINT [FormVersionToken_siteId_fkey] FOREIGN KEY ([siteId]) REFERENCES [dbo].[Site]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionToken] ADD CONSTRAINT [FormVersionToken_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionToken] ADD CONSTRAINT [FormVersionToken_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[FormVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
