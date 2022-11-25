/*
  Warnings:

  - Added the required column `createdByUserId` to the `ChildContentBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ChildContentBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `ContentBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ContentBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `ContentBlockVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ContentBlockVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `ContentBlockVariantOnSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ContentBlockVariantOnSite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `ContentBlockVariantVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ContentBlockVariantVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `ContentBlockVariantVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `ContentBlockVariantVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `FormVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `FormVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `FormVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `FormVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `Page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PageInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PageInstance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PageInstanceLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PageInstanceLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PageLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PageLayout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PageLayoutVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PageLayoutVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PageLayoutVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PageLayoutVersionPublication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `PublishingEnvironment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `PublishingEnvironment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdByUserId` to the `Site` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByUserId` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ChildContentBlock] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlock] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariant] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Form] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[FormVersion] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[FormVersionPublication] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Page] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PageInstance] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PageInstanceLayout] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PageLayout] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PageLayoutVersion] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PublishingEnvironment] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Site] ADD [createdByUserId] NVARCHAR(1000) NOT NULL,
[updatedByUserId] NVARCHAR(1000) NOT NULL;

-- AddForeignKey
ALTER TABLE [dbo].[PublishingEnvironment] ADD CONSTRAINT [PublishingEnvironment_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PublishingEnvironment] ADD CONSTRAINT [PublishingEnvironment_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Site] ADD CONSTRAINT [Site_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Site] ADD CONSTRAINT [Site_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Page] ADD CONSTRAINT [Page_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Page] ADD CONSTRAINT [Page_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstance] ADD CONSTRAINT [PageInstance_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstance] ADD CONSTRAINT [PageInstance_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstanceLayout] ADD CONSTRAINT [PageInstanceLayout_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageInstanceLayout] ADD CONSTRAINT [PageInstanceLayout_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayout] ADD CONSTRAINT [PageLayout_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayout] ADD CONSTRAINT [PageLayout_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersion] ADD CONSTRAINT [PageLayoutVersion_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersion] ADD CONSTRAINT [PageLayoutVersion_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD CONSTRAINT [PageLayoutVersionPublication_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlock] ADD CONSTRAINT [ContentBlock_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlock] ADD CONSTRAINT [ContentBlock_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChildContentBlock] ADD CONSTRAINT [ChildContentBlock_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChildContentBlock] ADD CONSTRAINT [ChildContentBlock_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariant] ADD CONSTRAINT [ContentBlockVariant_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariant] ADD CONSTRAINT [ContentBlockVariant_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD CONSTRAINT [ContentBlockVariantOnSite_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD CONSTRAINT [ContentBlockVariantOnSite_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD CONSTRAINT [ContentBlockVariantVersion_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD CONSTRAINT [ContentBlockVariantVersion_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD CONSTRAINT [ContentBlockVariantVersionPublication_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD CONSTRAINT [ContentBlockVariantVersionPublication_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Form] ADD CONSTRAINT [Form_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Form] ADD CONSTRAINT [Form_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersion] ADD CONSTRAINT [FormVersion_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersion] ADD CONSTRAINT [FormVersion_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionPublication] ADD CONSTRAINT [FormVersionPublication_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FormVersionPublication] ADD CONSTRAINT [FormVersionPublication_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
