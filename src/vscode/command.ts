import { ConversionErrorMessage, DefaultIndentSize } from "../constants";
import { env, TextEditor, TextEditorOptions, window } from "vscode";
import { IParser } from "../parser";

export async function pasteMonitor(editor: TextEditor, parser: IParser): Promise<void> {
    if (editor.document.languageId !== "yaml") {
        return;
    }

    configureIndentSize(parser, editor.options);

    try {
        const clipboardContent = await env.clipboard.readText();
        const converted = parser.parse(clipboardContent);

        if (converted) {
            editor.edit(editBuilder => {
                if (editor.selection.isEmpty) {
                    editBuilder.insert(editor.selection.start, converted);
                } else {
                    editBuilder.replace(editor.selection, converted);
                }
            });
        }
    } catch (e) {
        console.error(e);
        window.showErrorMessage(ConversionErrorMessage);
    }
}

function configureIndentSize(parser: IParser, options: TextEditorOptions): void {
    const indentSize = options.insertSpaces ? options.tabSize as number : DefaultIndentSize;
    parser.setIndentSize(indentSize);
}