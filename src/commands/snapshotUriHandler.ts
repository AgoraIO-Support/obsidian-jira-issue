import { App, Notice, ObsidianProtocolData } from 'obsidian'
import {
    JIRA_SNAPSHOT_TYPES,
    JiraSnapshotType,
    appendSnapshotToFile,
    runJiraSnapshot,
} from './snapshotCore'

function isValidType(type: string): type is JiraSnapshotType {
    return (JIRA_SNAPSHOT_TYPES as readonly string[]).includes(type)
}

export function createJiraSnapshotUriHandler(app: App) {
    return async (params: ObsidianProtocolData): Promise<void> => {
        const { type, value, target } = params
        if (!type || !value || !target) {
            new Notice('JiraIssue: URI requires `type`, `value`, and `target` params')
            return
        }
        if (!isValidType(type)) {
            new Notice(
                `JiraIssue: invalid type "${type}" — expected ${JIRA_SNAPSHOT_TYPES.join('|')}`
            )
            return
        }

        try {
            new Notice(`JiraIssue: Fetching ${type}=${value}...`)
            const { markdown, count } = await runJiraSnapshot(type, value)
            await appendSnapshotToFile(app, target, markdown)
            new Notice(`JiraIssue: Appended ${count} issues to ${target}`)
        } catch (e) {
            console.error('JiraIssue URI snapshot error:', e)
            new Notice(`JiraIssue: ${e.message || e}`)
        }
    }
}
