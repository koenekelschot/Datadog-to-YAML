import * as pageObserver  from "../../src/chrome/pageObserver";
import * as buttonInject from "../../src/chrome/buttonInject";

describe('processMutations', () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
        spy = jest.spyOn(buttonInject, "injectButton").mockImplementation(() => jest.fn());
    });

    it('should not inject when no added nodes are present', () => {
        pageObserver.processMutations(getNoMutationRecords());

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not inject when the correct node is not present', () => {
        pageObserver.processMutations(getIncorrectMutationRecords());

        expect(spy).not.toHaveBeenCalled();
    });

    it('should inject when the correct node is present', () => {
        pageObserver.processMutations(getCorrectMutationRecords());

        expect(spy).toHaveBeenCalledTimes(1);
    });
});

function getNoMutationRecords(): MutationRecord[] {
    return [({
        addedNodes: undefined,
    } as unknown) as MutationRecord, ({
        addedNodes: null,
    } as unknown) as MutationRecord, ({
        addedNodes: Array<Node>()
    } as unknown) as MutationRecord];
};

function getIncorrectMutationRecords(): MutationRecord[] {
    document.body.innerHTML = `
        <div id="without-class">test</div>
        <div class="with-incorrect-class">test</div>
        <div class="ReactModal ReactModal__Overlay">
            <div class="intermediate">
                <p>Alas, no header</p>
            </div>
        </div>
        <div class="ReactModal ReactModal__Overlay">
            <div class="intermediate">
                <h1>Wrong header kiddo!</h1>
            </div>
        </div>
        <div class="ReactModal ReactModal__Overlay">
            <div class="intermediate">
                <h1>monitor json</h1>
            </div>
        </div>
    `;
    
    return [({
        addedNodes: document.body.childNodes
    } as unknown) as MutationRecord];
};

function getCorrectMutationRecords(): MutationRecord[] {
    document.body.innerHTML = `
        <div class="ReactModal ReactModal__Overlay">
            <div class="intermediate">
                <h1>Monitor JSON</h1>
            </div>
        </div>
    `;
    
    return [({
        addedNodes: document.body.childNodes
    } as unknown) as MutationRecord];
};
