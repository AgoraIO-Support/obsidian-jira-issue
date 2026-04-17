import { App, Editor, Notice } from 'obsidian'
import { TextInputModal } from './textInputModal'
import { runJiraSnapshot } from './snapshotCore'

export function snapshotByUser(app: App, editor: Editor): void {
    new TextInputModal(
        app,
        'Snapshot: Tickets by User',
        'Enter Jira username',
        async (user: string) => {
            if (!user) {
                new Notice('JiraIssue: Username is required')
                return
            }
            try {
                new Notice('JiraIssue: Fetching tickets...')
                const { markdown, count } = await runJiraSnapshot('user', user)
                editor.replaceSelection(markdown)
                new Notice(`JiraIssue: Inserted ${count} issues`)
            } catch (e) {
                console.error('JiraIssue snapshot error:', e)
                new Notice(`JiraIssue: Failed to fetch tickets — ${e.message || e}`)
            }
        }
    ).open()
}
