BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PageInstanceLayout] (
    [id] NVARCHAR(1000) NOT NULL,
    [pageInstanceId] NVARCHAR(1000) NOT NULL,
    [pageLayoutId] NVARCHAR(1000) NOT NULL,
    [publishingEnvironmentId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PageInstanceLayout_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [PageInstanceLayout_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PageInstanceLayout_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PageInstanceLayout] ADD CONSTRAINT [PageInstanceLayout_pageInstanceId_fkey] FOREIGN KEY ([pageInstanceId]) REFERENCES [dbo].[PageInstance]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstanceLayout] ADD CONSTRAINT [PageInstanceLayout_pageLayoutId_fkey] FOREIGN KEY ([pageLayoutId]) REFERENCES [dbo].[PageLayout]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstanceLayout] ADD CONSTRAINT [PageInstanceLayout_publishingEnvironmentId_fkey] FOREIGN KEY ([publishingEnvironmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
