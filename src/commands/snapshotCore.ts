import { App, TFile } from 'obsidian'
import JiraClient from '../client/jiraClient'
import { SettingsData } from '../settings'
import { formatJiraSnapshotTable } from './snapshotHelper'

export type JiraSnapshotType = 'user' | 'component' | 'companyId'

export const JIRA_SNAPSHOT_TYPES: readonly JiraSnapshotType[] = [
    'user',
    'component',
    'companyId',
]

const BUSINESS_LINE_CLAUSE = '"Business Line" in ("探索（Explore）", "US/ROW")'
const TIMEFRAME_CLAUSE = '(created >= "-7d" OR updated >= "-7d")'

const USER_SNAPSHOT_COLUMNS = [
    'Key', 'Summary', 'Status', 'Priority', 'Assignee', 'Creator', 'Reporter', 'Components', 'Updated',
]

function buildJql(type: JiraSnapshotType, value: string): string {
    switch (type) {
        case 'user':
            return `(creator = "${value}" OR assignee = "${value}" OR watcher = "${value}") AND ${BUSINESS_LINE_CLAUSE} AND ${TIMEFRAME_CLAUSE} ORDER BY updated DESC`
        case 'component':
            return `component = "${value}" AND ${BUSINESS_LINE_CLAUSE} AND ${TIMEFRAME_CLAUSE} ORDER BY updated DESC`
        case 'companyId':
            return `CompanyID ~ "${value}" AND ${BUSINESS_LINE_CLAUSE} AND ${TIMEFRAME_CLAUSE} ORDER BY updated DESC`
    }
}

function titleFor(type: JiraSnapshotType, value: string): string {
    switch (type) {
        case 'user': return `Tickets for User: ${value}`
        case 'component': return `Tickets for Component: ${value}`
        case 'companyId': return `Tickets for Company ID: ${value}`
    }
}

function columnsFor(type: JiraSnapshotType): string[] | undefined {
    return type === 'user' ? USER_SNAPSHOT_COLUMNS : undefined
}

export interface JiraSnapshotResult {
    readonly markdown: string
    readonly count: number
    readonly title: string
}

export async function runJiraSnapshot(
    type: JiraSnapshotType,
    value: string,
): Promise<JiraSnapshotResult> {
    const account = SettingsData.accounts.length > 0
        ? SettingsData.accounts[0]
        : undefined

    const jql = buildJql(type, value)
    const results = await JiraClient.getSearchResults(jql, { limit: 100, account })

    const capturedAt = new Date()
    const title = titleFor(type, value)
    const markdown = formatJiraSnapshotTable(title, results.issues, capturedAt, columnsFor(type))

    return { markdown, count: results.issues.length, title }
}

export async function appendSnapshotToFile(
    app: App,
    targetPath: string,
    markdown: string,
): Promise<void> {
    const file = app.vault.getAbstractFileByPath(targetPath)
    if (!file || !(file instanceof TFile)) {
        throw new Error(`Target file not found: ${targetPath}`)
    }
    const existing = await app.vault.read(file)
    const separator = existing.length === 0 || existing.endsWith('\n\n')
        ? ''
        : existing.endsWith('\n') ? '\n' : '\n\n'
    const next = existing + separator + markdown + '\n'
    await app.vault.modify(file, next)
}
