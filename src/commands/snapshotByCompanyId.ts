import { App, Editor, Notice } from 'obsidian'
import { TextInputModal } from './textInputModal'
import { runJiraSnapshot } from './snapshotCore'

export function snapshotByCompanyId(app: App, editor: Editor): void {
    new TextInputModal(
        app,
        'Snapshot: Tickets by Company ID',
        'Enter Company ID',
        async (companyId: string) => {
            if (!companyId) {
                new Notice('JiraIssue: Company ID is required')
                return
            }
            try {
                new Notice('JiraIssue: Fetching tickets...')
                const { markdown, count } = await runJiraSnapshot('companyId', companyId)
                editor.replaceSelection(markdown)
                new Notice(`JiraIssue: Inserted ${count} issues`)
            } catch (e) {
                console.error('JiraIssue snapshot error:', e)
                new Notice(`JiraIssue: Failed to fetch tickets — ${e.message || e}`)
            }
        }
    ).open()
}
