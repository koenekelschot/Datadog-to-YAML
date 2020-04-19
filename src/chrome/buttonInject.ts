import { exportMonitor } from "./monitorExport";

export function injectButton(modal: Element): void {
    let buttons = modal.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        // if (buttons[i].innerText != "Copy") {
        //     continue;
        // }
        if (buttons[i].textContent != "Copy") { //todo: validate against real Datadog UI
            continue;
        }

        let yamlBtn = createButton(modal);
        buttons[i].insertAdjacentElement("afterend", yamlBtn);
        buttons[i].classList.replace("ui_form_button--primary", "ui_form_button--secondary");
        return;
    }
}

function createButton(modal: Element): Element {
    let button = document.createElement("button");
    button.classList.add("ui_form_button", "ui_form_button--md", "ui_form_button--primary");
    button.textContent = "Export as YAML";
    button.addEventListener("click", () => exportMonitor(modal));
    return button;
}