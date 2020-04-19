import { injectButton } from "./buttonInject";

export function processMutations(mutations: MutationRecord[]): void {
    mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            processAddedNodes(mutation.addedNodes);
        }
    })
}

function processAddedNodes(nodeList: NodeList): void {
    for (let i = 0; i < nodeList.length; i++) {
        const elem = nodeList[i] as Element;
        if (!elem.classList || !elem.classList.contains("ReactModal__Overlay")) {
            continue;
        }

        const headers = elem.getElementsByTagName("h1");
        // console.log(headers[0].innerText);
        // if (headers.length < 1 || headers[0].innerText != "Monitor JSON") {
        //     continue;
        // }
        if (headers.length < 1 || headers[0].textContent != "Monitor JSON") { //todo: validate against real Datadog UI
            continue;
        }

        injectButton(elem);
        return;
    }
}