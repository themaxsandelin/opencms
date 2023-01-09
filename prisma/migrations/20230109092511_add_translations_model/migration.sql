BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Translation] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(max) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Translation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Translation_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [createdByUserId] NVARCHAR(1000) NOT NULL,
    [updatedByUserId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Translation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Translation] ADD CONSTRAINT [Translation_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Translation] ADD CONSTRAINT [Translation_updatedByUserId_fkey] FOREIGN KEY ([updatedByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
