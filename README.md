# Datadog-to-YAML
Converts Datadog monitor JSON into YAML

This conversion can be done by means of the [Chrome extension](https://github.com/peckham/Datadog-to-YAML/tree/master/releases/chrome) or the [Visual Studio Code extension](https://github.com/peckham/Datadog-to-YAML/tree/master/releases/vscode). Or both, I don't really care how you decide to do it.

## Chrome
The Chrome extensions adds a new `Export to YAML` button to the JSON export of the Datadog UI. This button will add the YAML to your clipboard.

## Visual Studio Code
The Visual Studio Code extension is activated when you open a .yaml file in the editor. Once activated you can paste the Datadog monitor JSON (or probably any valid JSON) using the keyboard shortcut `Ctrl+D, Ctrl+D` or via `Paste Datadog as YAML` in the context menu.