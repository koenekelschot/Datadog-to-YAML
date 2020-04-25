import { processMutations } from "./pageObserver";

export function run(): void {
    const observer = new MutationObserver(processMutations);
    observer.observe(document.body, {
        attributes: true, 
        childList: true, 
        characterData: true,
        subtree: true
    });
}

run();