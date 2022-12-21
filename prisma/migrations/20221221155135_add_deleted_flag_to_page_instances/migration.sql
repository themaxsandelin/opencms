BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[PageInstance] ADD [deleted] BIT NOT NULL CONSTRAINT [PageInstance_deleted_df] DEFAULT 0;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
