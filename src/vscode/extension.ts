import { commands, ExtensionContext, TextEditor, window } from "vscode";
import { MonitorValidator } from "../monitorValidator";
import { Parser } from "../parser";
import { pasteMonitor } from "./command";
import { ValidationErrorMessage } from "../constants";

export function activate(context: ExtensionContext): void {
    const parser = new Parser(new MonitorValidator());
    parser.setOnValidationErrors((errors: string[]) => {
        errors.forEach(err => console.error(err));
        window.showErrorMessage(ValidationErrorMessage);
    });

    const pasteCommand = commands.registerTextEditorCommand(pasteMonitor.name, (editor: TextEditor) => pasteMonitor(editor, parser));
    context.subscriptions.push(pasteCommand);
}

export function deactivate(context: ExtensionContext): void {
    context.subscriptions.forEach(subscription => subscription.dispose());
}