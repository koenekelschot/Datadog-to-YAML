import { commands, env, ExtensionContext, Range, TextEditor, window, TextEditorOptions, TextEditorEdit } from 'vscode';
import { IParser, Parser } from "../parser";
import { MonitorValidator } from '../monitorValidator';
import { ValidationErrorMessage, ConversionErrorMessage, DefaultIndentSize } from '../constants';
import { pasteMonitor } from './command';

export function activate(context: ExtensionContext): void {
	const parser = new Parser(new MonitorValidator());
	parser.setOnValidationErrors((errors: string[]) => {
		errors.forEach(err => console.error(err));
		window.showErrorMessage(ValidationErrorMessage);
	});

	const pasteCommand = commands.registerTextEditorCommand(pasteMonitor.name, (editor: TextEditor) => pasteMonitor(editor, parser));
	context.subscriptions.push(pasteCommand);
};

export function deactivate(context: ExtensionContext): void {
	context.subscriptions.forEach(subscription => subscription.dispose());
};

// export async function pasteDatadogAsYAML(editor: TextEditor, parser: IParser): Promise<void> {
// 	if (editor.document.languageId !== 'yaml') {
// 		return;
// 	}

// 	configureIndentSize(parser, editor.options);

// 	try {
// 		const clipboardContent = await env.clipboard.readText();
// 		const converted = parser.parse(clipboardContent);

// 		if (converted) {
// 			editor.edit(editBuilder => {
// 				if (editor.selection.isEmpty) {
// 					editBuilder.insert(editor.selection.start, converted);
// 				} else {
// 					editBuilder.replace(new Range(editor.selection.start, editor.selection.end), converted);
// 				}
// 			});
// 		}
//     } catch (e) {
// 		console.error(e);
//         window.showErrorMessage(ConversionErrorMessage);
// 	}
// };

// function configureIndentSize(parser: IParser, options: TextEditorOptions) {
// 	const indentSize = options.insertSpaces ? options.tabSize as number : DefaultIndentSize;
// 	parser.setIndentSize(indentSize);
// };