import * as converter from '../converter';

function init(): void {
    let observer = new MutationObserver(processMutations);
    observer.observe(document.body, {
        attributes: true, 
        childList: true, 
        characterData: true,
        subtree: true
    });
};

function processMutations(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
        //console.log(mutation);
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            processAddedNodes(mutation.addedNodes);
        }
    })
};

function processAddedNodes(nodeList: NodeList): void {
    for (let i = 0; i < nodeList.length; i++) {
        let elem = nodeList[i] as Element;
        if (elem.classList && elem.classList.contains("v-Message")) {
            //console.log("Opened item!");
            injectButton(elem);
        }
    }
};

function injectButton(node: Element): void {
    let button = createButton();
    node.parentNode?.insertBefore(button, node);
};

function createButton(): Element {
    let button = document.createElement("button");
    button.textContent = "TEST";
    button.addEventListener("click", handleButtonClick)
    return button;
};

function handleButtonClick(): void {
    //alert("test");
    let container = document.getElementById("defanged1-divtagdefaultwrapper");
    let text = container?.innerText;
    if (!text) {
        return;
    }
    convertToYaml(text);
};

function convertToYaml(content: string): void {
    console.log(content);
    try {
        const converted = converter.convertToYaml(content, 2);
        console.log(converted);

    } catch (e) {
        console.log(e);
        alert("Could not convert monitor data to YAML");
	}
};

init();