/*
  Warnings:

  - You are about to drop the column `fileName` on the `FormVersionSubmissionFile` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[FormVersionSubmissionFile] DROP COLUMN [fileName];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
