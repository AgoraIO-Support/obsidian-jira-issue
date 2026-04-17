import { App, Editor, Notice } from 'obsidian'
import { TextInputModal } from './textInputModal'
import { runJiraSnapshot } from './snapshotCore'

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
            try {
                new Notice('JiraIssue: Fetching tickets...')
                const { markdown, count } = await runJiraSnapshot('component', componentName)
                editor.replaceSelection(markdown)
                new Notice(`JiraIssue: Inserted ${count} issues`)
            } catch (e) {
                console.error('JiraIssue snapshot error:', e)
                new Notice(`JiraIssue: Failed to fetch tickets — ${e.message || e}`)
            }
        }
    ).open()
}
