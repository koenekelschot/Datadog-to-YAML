import { env, Range, TextEditor, window, TextEditorOptions, TextEditorEdit } from 'vscode';
import { IParser } from "../parser";
import { ConversionErrorMessage, DefaultIndentSize } from '../constants';

export async function pasteMonitor(editor: TextEditor, parser: IParser): Promise<void> {
	if (editor.document.languageId !== 'yaml') {
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
					//editBuilder.replace(new Range(editor.selection.start, editor.selection.end), converted);
					editBuilder.replace(editor.selection, converted);
				}
			});
		}
    } catch (e) {
		console.error(e);
        window.showErrorMessage(ConversionErrorMessage);
	}
};

function configureIndentSize(parser: IParser, options: TextEditorOptions) {
	const indentSize = options.insertSpaces ? options.tabSize as number : DefaultIndentSize;
	parser.setIndentSize(indentSize);
};