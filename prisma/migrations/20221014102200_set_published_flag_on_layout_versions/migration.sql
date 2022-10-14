BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PageLayoutVersion] ADD [wasPublished] BIT NOT NULL CONSTRAINT [PageLayoutVersion_wasPublished_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
