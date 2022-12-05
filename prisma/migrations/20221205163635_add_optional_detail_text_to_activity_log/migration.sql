BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[ActivityLog] ADD [detailText] NVARCHAR(1000) NOT NULL CONSTRAINT [ActivityLog_detailText_df] DEFAULT '';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH