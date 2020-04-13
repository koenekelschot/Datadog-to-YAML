import { commands, env, ExtensionContext, Range, TextEditor, window } from 'vscode';
import { IParser, Parser } from "../parser";
import { MonitorValidator } from '../monitorValidator';

let parser: IParser;

export function activate(context: ExtensionContext) {
	parser = new Parser(new MonitorValidator());
	parser.setOnValidationErrors((errors: string[]) => {
		errors.forEach(err => console.error(err));
		window.showErrorMessage("Copied data is not a valid monitor");
	});

	let pasteCommand = commands.registerTextEditorCommand("pasteDatadogAsYAML", editor =>
		pasteDatadogAsYAML(editor)
	);

	context.subscriptions.push(pasteCommand);
}

export function deactivate() {}

export async function pasteDatadogAsYAML(editor: TextEditor) {

	if (editor.document.languageId !== 'yaml') {
		return;
	}

	try {
		const indentSize = editor.options.insertSpaces ? editor.options.tabSize as number : 2;
		const clipboardContent = await env.clipboard.readText();

		parser.setIndentSize(indentSize);
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
        window.showErrorMessage("Could not convert monitor data to YAML");
	}
}