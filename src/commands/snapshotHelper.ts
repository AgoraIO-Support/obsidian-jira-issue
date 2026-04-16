import { IJiraIssue } from '../interfaces/issueInterfaces'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEFAULT_COLUMNS = ['Key', 'Summary', 'Status', 'Priority', 'Assignee', 'Components', 'Updated']

export function formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

export function formatDateTime(date: Date): string {
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    return `${formatDate(date)} ${h}:${min}`
}

export function formatIssueDate(dateStr: string): string {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function getLastWeekDate(): Date {
    const now = new Date()
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
}

export function escapePipe(text: string): string {
    if (!text) return '-'
    return text.replace(/\|/g, '\\|')
}

function getFieldValue(issue: IJiraIssue, column: string): string {
    switch (column) {
        case 'Key': {
            const host = issue.account?.host || ''
            const normalizedHost = host.endsWith('/') ? host.slice(0, -1) : host
            return `[${escapePipe(issue.key)}](${normalizedHost}/browse/${issue.key})`
        }
        case 'Summary':
            return escapePipe(issue.fields.summary || '-')
        case 'Status':
            return escapePipe(issue.fields.status?.name || '-')
        case 'Priority':
            return escapePipe(issue.fields.priority?.name || '-')
        case 'Assignee':
            return escapePipe(issue.fields.assignee?.displayName || '-')
        case 'Reporter':
            return escapePipe(issue.fields.reporter?.displayName || '-')
        case 'Creator':
            return escapePipe(issue.fields.creator?.displayName || '-')
        case 'Components': {
            const components = issue.fields.components
            if (!components || components.length === 0) return '-'
            return escapePipe(components.map(c => c.name).join(', '))
        }
        case 'Updated':
            return formatIssueDate(issue.fields.updated)
        case 'Created':
            return formatIssueDate(issue.fields.created)
        default:
            return '-'
    }
}

export function formatJiraSnapshotTable(
    title: string,
    issues: IJiraIssue[],
    capturedAt: Date,
    columns?: string[]
): string {
    const cols = columns || DEFAULT_COLUMNS
    const lines: string[] = []

    lines.push(`## ${title} — ${formatDate(capturedAt)}`)
    lines.push('')

    // Header
    lines.push('| ' + cols.join(' | ') + ' |')
    lines.push('|' + cols.map(() => '---').join('|') + '|')

    // Rows
    for (const issue of issues) {
        const row = cols.map(col => getFieldValue(issue, col))
        lines.push('| ' + row.join(' | ') + ' |')
    }

    lines.push('')
    lines.push(`_${issues.length} issues · Captured at ${formatDateTime(capturedAt)}_`)

    return lines.join('\n')
}
