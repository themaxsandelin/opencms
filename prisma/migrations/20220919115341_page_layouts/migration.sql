BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[PageLayout] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [pageId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PageLayout_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PageLayoutVersion] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [pageLayoutId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PageLayoutVersion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PageLayoutVersionPublication] (
    [id] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PageLayoutVersionPublication_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[PageLayout] ADD CONSTRAINT [PageLayout_pageId_fkey] FOREIGN KEY ([pageId]) REFERENCES [dbo].[Page]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersion] ADD CONSTRAINT [PageLayoutVersion_pageLayoutId_fkey] FOREIGN KEY ([pageLayoutId]) REFERENCES [dbo].[PageLayout]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[PageLayoutVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
