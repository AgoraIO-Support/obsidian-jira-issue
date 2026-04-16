import { App, Editor, Notice } from 'obsidian'
import JiraClient from '../client/jiraClient'
import { SettingsData } from '../settings'
import { TextInputModal } from './textInputModal'
import { formatJiraSnapshotTable } from './snapshotHelper'

const USER_SNAPSHOT_COLUMNS = [
    'Key', 'Summary', 'Status', 'Priority', 'Assignee', 'Creator', 'Reporter', 'Components', 'Updated',
]

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

            const account = SettingsData.accounts.length > 0
                ? SettingsData.accounts[0]
                : undefined

            const jql = `(creator = "${user}" OR assignee = "${user}" OR watcher = "${user}") AND (created >= "-7d" OR updated >= "-7d") ORDER BY updated DESC`

            try {
                new Notice('JiraIssue: Fetching tickets...')
                const results = await JiraClient.getSearchResults(jql, {
                    limit: 100,
                    account,
                })

                const capturedAt = new Date()
                const title = `Tickets for User: ${user}`
                const table = formatJiraSnapshotTable(title, results.issues, capturedAt, USER_SNAPSHOT_COLUMNS)

                editor.replaceSelection(table)
                new Notice(`JiraIssue: Inserted ${results.issues.length} issues`)
            } catch (e) {
                console.error('JiraIssue snapshot error:', e)
                new Notice(`JiraIssue: Failed to fetch tickets — ${e.message || e}`)
            }
        }
    ).open()
}
