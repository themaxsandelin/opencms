BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[PageLayoutVersion] DROP CONSTRAINT [PageLayoutVersion_pageLayoutId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] DROP CONSTRAINT [PageLayoutVersionPublication_environmentId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] DROP CONSTRAINT [PageLayoutVersionPublication_versionId_fkey];

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersion] ADD CONSTRAINT [PageLayoutVersion_pageLayoutId_fkey] FOREIGN KEY ([pageLayoutId]) REFERENCES [dbo].[PageLayout]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[PageLayoutVersion]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
