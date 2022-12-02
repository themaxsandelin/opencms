/*
  Warnings:

  - You are about to drop the column `locale` on the `ContentBlockVariantVersion` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ContentBlockVariantVersion] DROP COLUMN [locale];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
