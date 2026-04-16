import { App, Editor, Notice } from 'obsidian'
import JiraClient from '../client/jiraClient'
import { SettingsData } from '../settings'
import { TextInputModal } from './textInputModal'
import { formatJiraSnapshotTable } from './snapshotHelper'

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

            const account = SettingsData.accounts.length > 0
                ? SettingsData.accounts[0]
                : undefined

            const jql = `CompanyID ~ "${companyId}" AND "Business Line" in ("探索（Explore）", "US/ROW") AND (created >= "-7d" OR updated >= "-7d") ORDER BY updated DESC`

            try {
                new Notice('JiraIssue: Fetching tickets...')
                const results = await JiraClient.getSearchResults(jql, {
                    limit: 100,
                    account,
                })

                const capturedAt = new Date()
                const title = `Tickets for Company ID: ${companyId}`
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
