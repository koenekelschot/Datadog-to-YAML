import * as buttonInject from "../../src/chrome/buttonInject";
import * as monitorExport from "../../src/chrome/monitorExport";

jest.mock("../../src/chrome/monitorExport");

describe('injectButton', () => {
    it('should not inject when no button present', () => {
        const modal = getModalElement(false);

        buttonInject.injectButton(modal);

        const buttons = modal.getElementsByTagName('button');
        expect(buttons.length).toBe(0);
    });

    it('should not inject when export button is not present', () => {
        const modal = getModalElement(true, "not the export button");

        buttonInject.injectButton(modal);

        const buttons = modal.getElementsByTagName('button');
        expect(buttons.length).toBe(1);
    });

    it('should inject button after the existing button', () => {
        const modal = getModalElement();

        buttonInject.injectButton(modal);

        const buttons = modal.getElementsByTagName('button');
        expect(buttons.length).toBe(2);
        expect(buttons[1].textContent).toBe("Export as YAML");
    });

    it('should make the new button the primary', () => {
        const modal = getModalElement();

        buttonInject.injectButton(modal);

        const buttons = modal.getElementsByTagName('button');
        expectButton(buttons[0], false);
        expectButton(buttons[1], true);

        buttons[1].dispatchEvent(new MouseEvent("click"));
    });

    it('click event should invoke export', () => {
        const spy = jest.spyOn(monitorExport, "exportMonitor");
        const modal = getModalElement();

        buttonInject.injectButton(modal);

        const buttons = modal.getElementsByTagName('button');
        buttons[1].dispatchEvent(new MouseEvent("click"));

        expect(spy).toHaveBeenCalledWith(modal);
    });
});

function getModalElement(withButton: boolean = true, buttonText: string = "Copy"): Element {
    document.body.innerHTML = `
        <div class="ReactModal__Overlay">
            <div class="ReactModal__Content">
                <div class="header"></div>
                <div class="body"></div>
                <div class="footer">
                    ${withButton ? `<button class="ui_form_button ui_form_button--md ui_form_button--primary">${buttonText}</button>` : '&nbsp;'}
                </div>
            </div>
        </div>
    `;

    return document.getElementsByTagName('div')[0] as Element;
};

function expectButton(button: Element, isPrimary: boolean): void {
    expect(button.classList).toContain("ui_form_button");
    expect(button.classList).toContain("ui_form_button--md");
    if (isPrimary) {
        expect(button.classList).toContain("ui_form_button--primary");
        expect(button.classList).not.toContain("ui_form_button--secondary");
    } else {
        expect(button.classList).toContain("ui_form_button--secondary");
        expect(button.classList).not.toContain("ui_form_button--primary");
    }
}
