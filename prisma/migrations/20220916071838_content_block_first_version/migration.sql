/*
  Warnings:

  - Added the required column `localeId` to the `ContentBlockVariantVersion` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD [localeId] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[SiteOnContentBlockVariant] (
    [id] NVARCHAR(1000) NOT NULL,
    [variantId] NVARCHAR(1000) NOT NULL,
    [siteId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [SiteOnContentBlockVariant_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ContentBlockVariantVersionPublication] (
    [id] NVARCHAR(1000) NOT NULL,
    [versionId] NVARCHAR(1000) NOT NULL,
    [environmentId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ContentBlockVariantVersionPublication_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[SiteOnContentBlockVariant] ADD CONSTRAINT [SiteOnContentBlockVariant_variantId_fkey] FOREIGN KEY ([variantId]) REFERENCES [dbo].[ContentBlockVariant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[SiteOnContentBlockVariant] ADD CONSTRAINT [SiteOnContentBlockVariant_siteId_fkey] FOREIGN KEY ([siteId]) REFERENCES [dbo].[Site]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD CONSTRAINT [ContentBlockVariantVersion_localeId_fkey] FOREIGN KEY ([localeId]) REFERENCES [dbo].[Locale]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD CONSTRAINT [ContentBlockVariantVersionPublication_versionId_fkey] FOREIGN KEY ([versionId]) REFERENCES [dbo].[ContentBlockVariantVersion]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD CONSTRAINT [ContentBlockVariantVersionPublication_environmentId_fkey] FOREIGN KEY ([environmentId]) REFERENCES [dbo].[PublishingEnvironment]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
