import os

FILE_PATH = "c:/Users/leduc/Documents/square-tuyen-dung-1/frontend/src/pages/components/employers/QuestionGroupsCard/index.tsx"

REPLACEMENTS = {
    '>Online Interview<': '>{t("questionGroupsCard.onlineInterview")}<',
    '>Question Groups<': '>{t("questionGroupsCard.questionGroups")}<',
    '>Add Question Group<': '>{t("questionGroupsCard.addQuestionGroup")}<',
    "header: 'Question Group Name',": "header: t('questionGroupsCard.table.groupName'),",
    "header: 'Number of Questions',": "header: t('questionGroupsCard.table.numberOfQuestions'),",
    "header: 'Description',": "header: t('questionGroupsCard.table.description'),",
    "getValue() || 'N/A'": "getValue() || t('questionGroupsCard.table.na')",
    "dialogMode === 'add' ? 'Add New Question Group' : 'Edit Question Group'": "dialogMode === 'add' ? t('questionGroupsCard.dialog.addTitle') : t('questionGroupsCard.dialog.editTitle')",
    ">Create New Question<": ">{t('questionGroupsCard.dialog.createNewQuestion')}<",
    ">Cancel<": ">{t('questionGroupsCard.dialog.cancel')}<",
    "isMutating ? 'Saving...' : 'Save'": "isMutating ? t('questionGroupsCard.dialog.saving') : t('questionGroupsCard.dialog.save')",
    "isCreatingQuestion ? 'Creating...' : 'Create'": "isCreatingQuestion ? t('questionGroupsCard.dialog.creating') : t('questionGroupsCard.dialog.create')",
    ">Confirm Delete<": ">{t('questionGroupsCard.dialog.confirmDeleteTitle')}<",
    ">Are you sure you want to delete the question group <": ">{t('questionGroupsCard.dialog.confirmDeleteMessage1')} <",
    "isMutating ? 'Deleting...' : 'Confirm Delete'": "isMutating ? t('questionGroupsCard.dialog.deleting') : t('questionGroupsCard.dialog.confirmDeleteBtn')",
    ">The questions inside will not be deleted, but their association with this group will be lost.<": ">{t('questionGroupsCard.dialog.confirmDeleteMessage2')}<",
}

def apply_replacements():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    for old, new in REPLACEMENTS.items():
        content = content.replace(old, new)

    # For default prop, wait, is `title` directly rendered? Yes, {title}
    # But `title` default value is "Question Groups Management". Let's ignore title default
    # because it might be overwritten. The breadcrumb gets the same text.
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Updated {FILE_PATH} successfully.")

if __name__ == '__main__':
    apply_replacements()
