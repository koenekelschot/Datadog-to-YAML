import { ExtensionContext, commands, Disposable, env, TextEditor, window } from 'vscode';
import { activate, pasteDatadogAsYAML, deactivate, ConversionErrorMessage, ValidationErrorMessage } from '../../src/vscode/extension';
import { Parser } from '../../src/parser';
import { MonitorValidator } from '../../src/monitorValidator';

jest.mock('vscode', () => {
    return {
        commands: {
            registerTextEditorCommand: jest.fn()
        },
        env: {
            clipboard: {
                readText: jest.fn().mockImplementation(() => { return "clipboard data"; })
            }
        },
        window: {
            showErrorMessage: jest.fn()
        }
    }
}, {virtual: true});

let mockContext: ExtensionContext;
let mockEditor: TextEditor;
let parser: MockParser;

beforeEach(() => {
    mockContext = { 
        subscriptions: Array<Disposable>() 
    } as ExtensionContext;
    mockEditor = ({
        document: {
            languageId: "yaml"
        },
        options: {
            insertSpaces: false
        },
        edit: jest.fn()
    } as unknown) as TextEditor;
    parser = new MockParser();

    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('activate', () => {
    it('should register the text editor command', () => {
        activate(mockContext);

        expect(commands.registerTextEditorCommand).toHaveBeenCalledWith(pasteDatadogAsYAML.name, expect.anything());
        expect(mockContext.subscriptions.length).toBe(1);
    });

    it('should call setOnValidationErrors on parser', () => {
        activate(mockContext, parser);

        expect(parser.onValidationErrorsSet).toBe(true);
    });
});

describe('deactivate', () => {
    it('should dispose subscriptions', () => {
        const disposable = { dispose: jest.fn() };
        mockContext.subscriptions.push(disposable);
        
        deactivate(mockContext);

        expect(disposable.dispose).toHaveBeenCalled();
    });
});

describe('pasteDatadogAsYAML', () => {
    it('should do nothing when editor language is not yaml', async () => {
        const editor = {
            document: {
                languageId: "not-yaml"
            }
        } as TextEditor;
        
        await pasteDatadogAsYAML(editor, parser);

        expect(parser.indentSizeSet).toBe(false);
        expect(env.clipboard.readText).not.toHaveBeenCalled();
        expect(parser.parsedJson).toBeNull();
    });

    describe('set indent size', () => {
        it('should set the indent size when configured', async () => {
            const editor = {
                document: {
                    languageId: "yaml"
                },
                options: {
                    insertSpaces: true,
                    tabSize: 6
                }
            } as TextEditor;
            await pasteDatadogAsYAML(editor, parser);

            expect(parser.indentSizeSet).toBe(true);
        });

        it('should set a default indent size when not configured', async () => {
            await pasteDatadogAsYAML(mockEditor, parser);

            expect(parser.indentSizeSet).toBe(true);
        });
    });

    it('should read the clipboard contents', async () => {
        await pasteDatadogAsYAML(mockEditor, parser);

        expect(env.clipboard.readText).toHaveBeenCalled();
    });

    it('should parse the clipboard contents', async () => {
        await pasteDatadogAsYAML(mockEditor, parser);

        expect(parser.parsedJson).not.toBeNull();
    });

    describe('valid monitor data', () => {
        it('should paste yaml', async () => {
            parser.isValid = true;

            await pasteDatadogAsYAML(mockEditor, parser);

            expect(mockEditor.edit).toHaveBeenCalled();
        });
    });

    describe('invalid monitor data', () => {
        it('should show message when input is not JSON', async () => {
            (env.clipboard.readText as jest.Mock).mockImplementationOnce(() => {
                return "not json";
            });

            await pasteDatadogAsYAML(mockEditor, parser);

            expect(window.showErrorMessage).toBeCalledWith(ConversionErrorMessage);
        });

        it('should show message when input is not a valid monitor', async () => {
            (env.clipboard.readText as jest.Mock).mockImplementationOnce(() => {
                return "{}";
            });

            activate(mockContext, parser);
            await pasteDatadogAsYAML(mockEditor, parser);

            expect(window.showErrorMessage).toBeCalledWith(ValidationErrorMessage);
        });
    });
});

class MockParser extends Parser {
    private parsed: string | null = null;
    public isValid: boolean = false;

    public get indentSizeSet(): boolean {
        return this.indentSize !== 0;
    }

    public get onValidationErrorsSet(): boolean {
        return this.onValidationErrors !== undefined;
    }

    public get parsedJson(): string | null {
        return this.parsed;
    }

    public constructor() {
        super(new MonitorValidator());
        this.indentSize = 0;
    }

    public parse(json: string): string | null {
        this.parsed = json;
        if (this.isValid) {
            return json;
        }
        return super.parse(json);
    }
}