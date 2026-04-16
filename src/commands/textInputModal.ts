import { App, Modal, Setting } from 'obsidian'

export class TextInputModal extends Modal {
    private _title: string
    private _placeholder: string
    private _onSubmit: (value: string) => void
    private _defaultValue: string

    constructor(
        app: App,
        title: string,
        placeholder: string,
        onSubmit: (value: string) => void,
        defaultValue?: string
    ) {
        super(app)
        this._title = title
        this._placeholder = placeholder
        this._onSubmit = onSubmit
        this._defaultValue = defaultValue || ''
    }

    onOpen() {
        const { contentEl } = this
        contentEl.empty()
        contentEl.createEl('h2', { text: this._title })

        let inputValue = this._defaultValue

        new Setting(contentEl)
            .addText(text => {
                text.setPlaceholder(this._placeholder)
                    .setValue(this._defaultValue)
                    .onChange(value => {
                        inputValue = value
                    })
                text.inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        this.close()
                        this._onSubmit(inputValue.trim())
                    }
                })
                // Auto-focus the input
                setTimeout(() => text.inputEl.focus(), 10)
            })

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Submit')
                .setCta()
                .onClick(() => {
                    this.close()
                    this._onSubmit(inputValue.trim())
                }))
    }

    onClose() {
        this.contentEl.empty()
    }
}
