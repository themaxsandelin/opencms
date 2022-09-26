BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ContentBlock] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlock_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlock_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariant] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariant_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariant_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantOnSite] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantOnSite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantOnSite_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantVersion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantVersion_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersionPublication] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantVersionPublication_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [ContentBlockVariantVersionPublication_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[Page] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Page_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [Page_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[PageLayout] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [PageLayout_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [PageLayout_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[PageLayoutVersion] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [PageLayoutVersion_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [PageLayoutVersion_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[PageLayoutVersionPublication] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [PageLayoutVersionPublication_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [PageLayoutVersionPublication_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[PublishingEnvironment] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [PublishingEnvironment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [PublishingEnvironment_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[Site] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Site_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL CONSTRAINT [Site_updatedAt_df] DEFAULT CURRENT_TIMESTAMP;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
