import { ConversionErrorMessage, ValidationErrorMessage } from "../constants";
import { MonitorValidator } from "../monitorValidator";
import { Parser } from "../parser";

export async function exportMonitor(modal: Element): Promise<void> {
    const textareas = modal.getElementsByTagName("textarea");
    if (textareas.length < 1) {
        alert("Could not find monitor JSON");
        return;
    }

    try {
        const parser = new Parser(new MonitorValidator());
        parser.setOnValidationErrors((errors: string[]) => {
            errors.forEach(err => console.error(err));
            alert(ValidationErrorMessage);
        });

        const converted = parser.parse(textareas[0].value);
        if (converted) {
            navigator.clipboard.writeText(converted).then(() => {
                alert("Monitor YAML copied to clipboard");
            }, (rejectReason) => {
                alert("Could not copy monitor YAML to clipboard");
                console.error(rejectReason);
            });
        }
    } catch (e) {
        console.error(e);
        alert(ConversionErrorMessage);
    }
}