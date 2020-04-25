import { ExtensionContext, commands, Disposable, TextEditor, window } from 'vscode';
import { activate, deactivate } from '../../src/vscode/extension';
import { Parser } from '../../src/parser';
import { ValidationErrorMessage } from '../../src/constants';
import * as command from '../../src/vscode/command';

let mockRegisterTextEditorCallback: ((editor: TextEditor) => void) | null;
let mockOnValidationErrorsCalled: boolean;
let mockOnValidationErrors: ((errors: string[]) => void) | null;

jest.mock("../../src/vscode/command");

jest.mock("vscode", () => {
    return {
        commands: {
            registerTextEditorCommand: jest.fn().mockImplementation((_command: string, callback: (editor: TextEditor) => void) => {
                mockRegisterTextEditorCallback = callback;
            })
        },
        window: {
            showErrorMessage: jest.fn()
        }
    };
}, {virtual: true});

jest.mock("../../src/parser", () => {
    return {
        Parser: jest.fn().mockImplementation(() => {
            return {
                setOnValidationErrors: jest.fn().mockImplementation((callback: (errors: string[]) => void) => {
                    mockOnValidationErrorsCalled = true;
                    mockOnValidationErrors = callback;
                })
            }
        })
    };
});

const mockExtensionContext = {
    subscriptions: new Array<Disposable>()
} as ExtensionContext;

beforeEach(() => {
    mockRegisterTextEditorCallback = null;
    mockOnValidationErrorsCalled = false;
    mockOnValidationErrors = null;
    mockExtensionContext.subscriptions.splice(0);
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => jest.fn());
});

describe('activate', () => {
    it('should instantiate parser', () => {
        activate(mockExtensionContext);

        expect(Parser).toHaveBeenCalledTimes(1);
    });

    it('should configure parser', () => {
        activate(mockExtensionContext);

        expect(mockOnValidationErrorsCalled).toBe(true);
    });

    it('should notify on validation errors', () => {
        const spy = jest.spyOn(window, 'showErrorMessage');

        activate(mockExtensionContext);
        if (mockOnValidationErrors !== null) {
            mockOnValidationErrors(["fake"]);
        }

        expect(spy).toHaveBeenCalledWith(ValidationErrorMessage);
    });

    it('should call registerTextEditorCommand', () => {
        activate(mockExtensionContext);

        expect(commands.registerTextEditorCommand).toHaveBeenCalledWith(command.pasteMonitor.name, expect.anything());
        expect(mockExtensionContext.subscriptions.length).toBe(1);
    });

    it('should register the pasteMonitor command ', () => {
        const spy = jest.spyOn(command, "pasteMonitor");
        const mockTextEditor = (jest.fn() as unknown) as TextEditor

        activate(mockExtensionContext);
        if (mockRegisterTextEditorCallback !== null) {
            mockRegisterTextEditorCallback(mockTextEditor);
        }

        expect(spy).toHaveBeenCalledWith(mockTextEditor, expect.anything());
    });
});

describe('deactivate', () => {
    it('should dispose subscriptions', () => {
        const disposable = { dispose: jest.fn() };
        mockExtensionContext.subscriptions.push(disposable);
        
        deactivate(mockExtensionContext);

        expect(disposable.dispose).toHaveBeenCalled();
    });
});