/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionsOnCategories` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[QuestionsOnCategories] DROP CONSTRAINT [QuestionsOnCategories_categoryId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[QuestionsOnCategories] DROP CONSTRAINT [QuestionsOnCategories_questionId_fkey];

-- DropTable
DROP TABLE [dbo].[Question];

-- DropTable
DROP TABLE [dbo].[QuestionCategory];

-- DropTable
DROP TABLE [dbo].[QuestionsOnCategories];

-- CreateTable
CREATE TABLE [dbo].[PublishingEnvironment] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [PublishingEnvironment_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PublishingEnvironment_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[Locale] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Locale_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Locale_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[ContentBlock] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ContentBlock_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ContentBlockVariant] (
    [id] NVARCHAR(1000) NOT NULL,
    [contentBlockId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ContentBlockVariant_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ContentBlockVariantVersion] (
    [id] NVARCHAR(1000) NOT NULL,
    [content] NVARCHAR(max) NOT NULL,
    [contentBlockVariantId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [ContentBlockVariantVersion_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariant] ADD CONSTRAINT [ContentBlockVariant_contentBlockId_fkey] FOREIGN KEY ([contentBlockId]) REFERENCES [dbo].[ContentBlock]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[ContentBlockVariantVersion] ADD CONSTRAINT [ContentBlockVariantVersion_contentBlockVariantId_fkey] FOREIGN KEY ([contentBlockVariantId]) REFERENCES [dbo].[ContentBlockVariant]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
