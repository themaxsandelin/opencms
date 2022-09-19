/*
  Warnings:

  - You are about to drop the column `localeId` on the `ContentBlockVariantVersion` table. All the data in the column will be lost.
  - You are about to drop the `Locale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SiteOnContentBlockVariant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `ContentBlockVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locale` to the `ContentBlockVariantVersion` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersion] DROP CONSTRAINT [ContentBlockVariantVersion_localeId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[SiteOnContentBlockVariant] DROP CONSTRAINT [SiteOnContentBlockVariant_siteId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[SiteOnContentBlockVariant] DROP CONSTRAINT [SiteOnContentBlockVariant_variantId_fkey];

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariant] ADD [name] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersion] DROP COLUMN [localeId];
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD [locale] NVARCHAR(1000) NOT NULL;

-- DropTable
DROP TABLE [dbo].[Locale];

-- DropTable
DROP TABLE [dbo].[SiteOnContentBlockVariant];

-- CreateTable
CREATE TABLE [dbo].[ContentBlockVariantOnSite] (
    [id] NVARCHAR(1000) NOT NULL,
    [variantId] NVARCHAR(1000) NOT NULL,
    [siteId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ContentBlockVariantOnSite_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD CONSTRAINT [ContentBlockVariantOnSite_variantId_fkey] FOREIGN KEY ([variantId]) REFERENCES [dbo].[ContentBlockVariant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD CONSTRAINT [ContentBlockVariantOnSite_siteId_fkey] FOREIGN KEY ([siteId]) REFERENCES [dbo].[Site]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
