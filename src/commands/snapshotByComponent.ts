import { App, Editor, Notice } from 'obsidian'
import JiraClient from '../client/jiraClient'
import { SettingsData } from '../settings'
import { TextInputModal } from './textInputModal'
import { formatJiraSnapshotTable } from './snapshotHelper'

export function snapshotByComponent(app: App, editor: Editor): void {
    new TextInputModal(
        app,
        'Snapshot: Tickets by Component',
        'Enter component name',
        async (componentName: string) => {
            if (!componentName) {
                new Notice('JiraIssue: Component name is required')
                return
            }

            const account = SettingsData.accounts.length > 0
                ? SettingsData.accounts[0]
                : undefined

            const jql = `component = "${componentName}" AND "Business Line" in ("探索（Explore）", "US/ROW") AND (created >= "-7d" OR updated >= "-7d") ORDER BY updated DESC`

            try {
                new Notice('JiraIssue: Fetching tickets...')
                const results = await JiraClient.getSearchResults(jql, {
                    limit: 100,
                    account,
                })

                const capturedAt = new Date()
                const title = `Tickets for Component: ${componentName}`
                const table = formatJiraSnapshotTable(title, results.issues, capturedAt)

                editor.replaceSelection(table)
                new Notice(`JiraIssue: Inserted ${results.issues.length} issues`)
            } catch (e) {
                console.error('JiraIssue snapshot error:', e)
                new Notice(`JiraIssue: Failed to fetch tickets — ${e.message || e}`)
            }
        }
    ).open()
}
