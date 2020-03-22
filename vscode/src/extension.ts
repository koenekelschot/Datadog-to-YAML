// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import yaml = require('js-yaml');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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
		const clipboardContent = await vscode.env.clipboard.readText();
		let jsonObject = JSON.parse(clipboardContent);

		if (Object.keys(jsonObject).includes("id")) {
			delete jsonObject.id;
		}
		
		const indentSize = editor.options.insertSpaces ? editor.options.tabSize as number : 2;
		const converted = yaml.safeDump(jsonObject, {indent: indentSize});

		editor.edit(editBuilder => {
			if (editor.selection.isEmpty) {
				editBuilder.insert(editor.selection.start, converted);
			} else {
				editBuilder.replace(new vscode.Range(editor.selection.start, editor.selection.end), converted);
			}
		});
    } catch (e) {
        vscode.window.showErrorMessage("Could not convert clipboard contents to monitor YAML");
	}
}