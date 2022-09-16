BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Site] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Site_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Site_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[Page] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [siteId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Page_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Question] (
    [id] NVARCHAR(1000) NOT NULL,
    [question] NVARCHAR(1000) NOT NULL,
    [answer] VARBINARY(max) NOT NULL,
    CONSTRAINT [Question_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[QuestionCategory] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [QuestionCategory_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[QuestionsOnCategories] (
    [questionId] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [QuestionsOnCategories_pkey] PRIMARY KEY CLUSTERED ([questionId],[categoryId])
);

-- AddForeignKey
ALTER TABLE [dbo].[Page] ADD CONSTRAINT [Page_siteId_fkey] FOREIGN KEY ([siteId]) REFERENCES [dbo].[Site]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[QuestionsOnCategories] ADD CONSTRAINT [QuestionsOnCategories_questionId_fkey] FOREIGN KEY ([questionId]) REFERENCES [dbo].[Question]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[QuestionsOnCategories] ADD CONSTRAINT [QuestionsOnCategories_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[QuestionCategory]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
