// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as converter from '../converter';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log("activated");
	let pasteCommand = vscode.commands.registerTextEditorCommand("pasteDatadogAsYAML", editor =>
		pasteDatadogAsYAML(editor)
	);

	context.subscriptions.push(pasteCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}

export async function pasteDatadogAsYAML(editor: vscode.TextEditor) {

	if (editor.document.languageId !== 'yaml') {
		return;
	}

	try {
		const indentSize = editor.options.insertSpaces ? editor.options.tabSize as number : 2;
		const clipboardContent = await vscode.env.clipboard.readText();
		const converted = converter.convertToYaml(clipboardContent, indentSize);

		editor.edit(editBuilder => {
			if (editor.selection.isEmpty) {
				editBuilder.insert(editor.selection.start, converted);
			} else {
				editBuilder.replace(new vscode.Range(editor.selection.start, editor.selection.end), converted);
			}
		});
    } catch (e) {
        vscode.window.showErrorMessage("Could not convert monitor data to YAML");
	}
}