import { commands, env, ExtensionContext, Range, TextEditor, window, TextEditorOptions } from 'vscode';
import { IParser, Parser } from "../parser";
import { MonitorValidator } from '../monitorValidator';
import { ValidationErrorMessage, ConversionErrorMessage } from '../constants';

export function activate(context: ExtensionContext, parser: IParser = new Parser(new MonitorValidator())): void {
	parser.setOnValidationErrors((errors: string[]) => {
		errors.forEach(err => console.error(err));
		window.showErrorMessage(ValidationErrorMessage);
	});

	const registerCallback = (editor: TextEditor) => pasteDatadogAsYAML(editor, parser);
	const pasteCommand = commands.registerTextEditorCommand(pasteDatadogAsYAML.name, registerCallback);
	context.subscriptions.push(pasteCommand);
};

export function deactivate(context: ExtensionContext): void {
	context.subscriptions.forEach(subscription => subscription.dispose());
};

export async function pasteDatadogAsYAML(editor: TextEditor, parser: IParser): Promise<void> {
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
					editBuilder.replace(new Range(editor.selection.start, editor.selection.end), converted);
				}
			});
		}
    } catch (e) {
		console.error(e);
        window.showErrorMessage(ConversionErrorMessage);
	}
};

function configureIndentSize(parser: IParser, options: TextEditorOptions) {
	const indentSize = options.insertSpaces ? options.tabSize as number : 2;
	parser.setIndentSize(indentSize);
};