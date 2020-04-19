import { run }  from "../../src/chrome/main";

describe('run', () => {
    it('should register the mutation observer', () => {
        const spy = jest.spyOn(MutationObserver.prototype, 'observe');

        run();

        expect(spy).toBeCalledWith(document.body, {
            attributes: true, 
            childList: true, 
            characterData: true,
            subtree: true
        });
    });
});