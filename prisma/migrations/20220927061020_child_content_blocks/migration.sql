BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ChildContentBlock] (
    [id] NVARCHAR(1000) NOT NULL,
    [parentId] NVARCHAR(1000) NOT NULL,
    [childId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ChildContentBlock_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [ChildContentBlock_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ChildContentBlock_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ChildContentBlock] ADD CONSTRAINT [ChildContentBlock_parentId_fkey] FOREIGN KEY ([parentId]) REFERENCES [dbo].[ContentBlock]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChildContentBlock] ADD CONSTRAINT [ChildContentBlock_childId_fkey] FOREIGN KEY ([childId]) REFERENCES [dbo].[ContentBlock]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
