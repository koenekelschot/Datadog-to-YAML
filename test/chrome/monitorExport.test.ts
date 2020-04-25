import * as monitorExport from "../../src/chrome/monitorExport";
import { ConversionErrorMessage, ValidationErrorMessage } from "../../src/constants";
import { Parser } from "../../src/parser";

let mockOnValidationErrorsCalled: boolean;
let mockOnValidationErrors: ((errors: string[]) => void) | null;
let mockParseCalled: boolean;
let mockValidationErrors: boolean;
let mockParseException: boolean;

jest.mock("../../src/parser", () => {
    return {
        Parser: jest.fn().mockImplementation(() => {
            return {
                setOnValidationErrors: jest.fn().mockImplementation((callback: (errors: string[]) => void) => {
                    mockOnValidationErrorsCalled = true;
                    mockOnValidationErrors = callback;
                }),
                parse: jest.fn().mockImplementation((json: string) => {
                    mockParseCalled = true;
                    if (mockParseException) {
                        throw new SyntaxError("fake");
                    }
                    if (mockValidationErrors) {
                        if (mockOnValidationErrors !== null) {
                            mockOnValidationErrors(["fake"]);
                        }
                    }
                    return json;
                })
            };
        })
    };
});

let mockClipboardError: boolean;
const mockClipboard = {
    writeText: jest.fn().mockImplementation((_data) => {
        if (mockClipboardError) {
            return Promise.reject("mocked reject");
        }
        return Promise.resolve();
    })
};
(global as any).navigator.clipboard = mockClipboard;

beforeEach(() => {
    mockOnValidationErrorsCalled = false;
    mockOnValidationErrors = null;
    mockParseCalled = false;
    mockValidationErrors = false;
    mockParseException = false;
    mockClipboardError = false;
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => jest.fn());
});

describe("exportMonitor", () => {
    describe("no data present", () => {
        it("should notify when data is not found", async () => {
            const spy = jest.spyOn(window, "alert");

            await monitorExport.exportMonitor(getModalElement(false));

            expect(spy).toHaveBeenCalledWith("Could not find monitor JSON");
        });

        it("should not instantiate parser", async () => {
            await monitorExport.exportMonitor(getModalElement(false));

            expect(Parser).not.toHaveBeenCalled();
        });
    });

    describe("data present", () => {
        it("should instantiate parser", async () => {
            await monitorExport.exportMonitor(getModalElement());

            expect(Parser).toHaveBeenCalledTimes(1);
        });

        it("should configure parser", async () => {
            await monitorExport.exportMonitor(getModalElement());

            expect(mockOnValidationErrorsCalled).toBe(true);
        });

        it("should parse data", async () => {
            await monitorExport.exportMonitor(getModalElement());

            expect(mockParseCalled).toBe(true);
        });

        it("should notify on exception", async () => {
            const spy = jest.spyOn(window, "alert");
            mockParseException = true;

            await monitorExport.exportMonitor(getModalElement());

            expect(mockParseCalled).toBe(true);
            expect(spy).toHaveBeenCalledWith(ConversionErrorMessage);
        });

        it("should notify on validation error", async () => {
            const spy = jest.spyOn(window, "alert");
            mockValidationErrors = true;

            await monitorExport.exportMonitor(getModalElement());

            expect(mockParseCalled).toBe(true);
            expect(spy).toHaveBeenCalledWith(ValidationErrorMessage);
        });

        it("should not copy when copied data is empty", async () => {
            const spy = jest.spyOn(mockClipboard, "writeText");

            await monitorExport.exportMonitor(getModalElement(true, ""));

            expect(spy).not.toHaveBeenCalled();
        });

        it("should copy yaml to clipboard", async () => {
            const spy = jest.spyOn(mockClipboard, "writeText");

            await monitorExport.exportMonitor(getModalElement());

            expect(spy).toHaveBeenCalled();
        });

        it("should notify success on copy", async () => {
            const spy = jest.spyOn(window, "alert");

            await monitorExport.exportMonitor(getModalElement());

            expect(spy).toHaveBeenCalledWith("Monitor YAML copied to clipboard");
        });

        it("should notify error on copy", async () => {
            const spy = jest.spyOn(window, "alert");
            mockClipboardError = true;

            await monitorExport.exportMonitor(getModalElement());

            expect(spy).toHaveBeenCalledWith("Could not copy monitor YAML to clipboard");
        });
    });
});

function getModalElement(withTextarea = true, textareaContents = "something something"): Element {
    document.body.innerHTML = `
        <div class="ReactModal__Overlay">
            <div class="ReactModal__Content">
                <div class="header"></div>
                <div class="body">
                    ${withTextarea ? `<textarea>${textareaContents}</textarea>` : "&nbsp;"}
                </div>
                <div class="footer"></div>
            </div>
        </div>
    `;

    return document.getElementsByTagName("div")[0] as Element;
}
