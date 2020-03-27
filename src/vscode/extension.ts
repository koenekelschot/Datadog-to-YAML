import { commands, env, ExtensionContext, Range, TextEditor, window } from 'vscode';
import { convertToYaml } from '../converter';

export function activate(context: ExtensionContext) {
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
		const converted = convertToYaml(clipboardContent, indentSize);

		editor.edit(editBuilder => {
			if (editor.selection.isEmpty) {
				editBuilder.insert(editor.selection.start, converted);
			} else {
				editBuilder.replace(new Range(editor.selection.start, editor.selection.end), converted);
			}
		});
    } catch (e) {
        window.showErrorMessage("Could not convert monitor data to YAML");
	}
}