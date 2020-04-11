import { sanitize } from '../sanitizer';
import { convertToYaml } from '../converter';
import { isValidMonitorJSON } from '../validator';

function init(): void {
    let observer = new MutationObserver(processMutations);
    observer.observe(document.body, {
        attributes: true, 
        childList: true, 
        characterData: true,
        subtree: true
    });
}

function processMutations(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            processAddedNodes(mutation.addedNodes);
        }
    })
}

function processAddedNodes(nodeList: NodeList): void {
    for (let i = 0; i < nodeList.length; i++) {
        let elem = nodeList[i] as Element;
        if (!elem.classList || !elem.classList.contains("ReactModal__Overlay")) {
            continue;
        }

        let header = elem.getElementsByTagName("h1");
        if (header.length < 1 || header[0].innerText != "Monitor JSON") {
            continue;
        }

        injectButton(elem);
        return;
    }
}

function injectButton(modal: Element): void {
    let buttons = modal.getElementsByTagName("button");
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].innerText != "Copy") {
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
    button.addEventListener("click", () => {
        handleYamlButtonClick(modal);
    });
    return button;
}

function handleYamlButtonClick(modal: Element): void {
    let textareas = modal.getElementsByTagName("textarea");
    if (textareas.length < 1) {
        alert("Could not find monitor JSON");
        return;
    }

    let yaml;
    try {
        const sanitized = sanitize(textareas[0].value);

        if (!isValidMonitorJSON(sanitized)) {
			alert("Copied data is not a valid monitor");
			return;
		}

        yaml = convertToYaml(sanitized, 2);
    } catch (e) {
        console.error(e);
        alert("Could not convert monitor JSON to YAML");
        return;
    }
    
    navigator.clipboard.writeText(yaml).then(() => {
        alert("Monitor YAML copied to clipboard");
    }, (rejectReason) => {
        alert("Could not copy monitor YAML to clipboard")
        console.error(rejectReason);
    });
}

init();