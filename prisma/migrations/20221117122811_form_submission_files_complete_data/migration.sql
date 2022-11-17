/*
  Warnings:

  - Added the required column `fileName` to the `FormVersionSubmissionFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `FormVersionSubmissionFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `FormVersionSubmissionFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `FormVersionSubmissionFile` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[FormVersionSubmissionFile] ADD [fileName] NVARCHAR(1000) NOT NULL,
[mimeType] NVARCHAR(1000) NOT NULL,
[originalName] NVARCHAR(1000) NOT NULL,
[size] INT NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
