import { env, TextEditor, window, TextEditorEdit } from 'vscode';
import { IParser } from '../../src/parser';
import { ConversionErrorMessage, DefaultIndentSize } from '../../src/constants';
import { pasteMonitor } from '../../src/vscode/command';

jest.mock("vscode", () => {
    return {
        env: {
            clipboard: {
                readText: jest.fn().mockImplementation(() => { return "clipboard data"; })
            }
        },
        window: {
            showErrorMessage: jest.fn()
        }
    };
}, {virtual: true});

let mockParser: IParser;

let mockEditor = {
    document: {
        languageId: "yaml"
    },
    options: {
        insertSpaces: true,
        tabSize: 6
    },
    edit: jest.fn().mockImplementation(() => {}),
    selection: {
        isEmpty: true,
        start: 0,
        end: 12
    }
} as unknown as TextEditor;

const mockTextEditorEdit = {
    insert: jest.fn().mockImplementation(() => {}),
    replace: jest.fn().mockImplementation(() => {})
} as unknown as TextEditorEdit;

beforeEach(() => {
    mockParser = new MockParser();
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => jest.fn());
});

describe('pasteMonitor', () => {
    it('should do nothing when editor language is not yaml', async () => {
        const editor = {
            document: {
                languageId: "not-yaml"
            }
        } as TextEditor;
        const indentSpy = jest.spyOn(mockParser, "setIndentSize");
        const parseSpy = jest.spyOn(mockParser, "parse");

        await pasteMonitor(editor, mockParser);

        expect(indentSpy).not.toHaveBeenCalled();
        expect(env.clipboard.readText).not.toHaveBeenCalled();
        expect(parseSpy).not.toHaveBeenCalled();
    });

    describe('set indent size', () => {
        it('should set the indent size when configured', async () => {
            const spy = jest.spyOn(mockParser, "setIndentSize");

            await pasteMonitor(mockEditor, mockParser);

            expect(spy).toHaveBeenCalledWith(mockEditor.options.tabSize);
        });

        it('should set a default indent size when not configured', async () => {
            mockEditor.options.insertSpaces = false;
            const spy = jest.spyOn(mockParser, "setIndentSize");

            await pasteMonitor(mockEditor, mockParser);

            expect(spy).toHaveBeenCalledWith(DefaultIndentSize);
        });
    });

    it('should parse the clipboard contents', async () => {
        const parseSpy = jest.spyOn(mockParser, "parse");

        await pasteMonitor(mockEditor, mockParser);

        expect(env.clipboard.readText).toHaveBeenCalled();
        expect(parseSpy).toHaveBeenCalled();
    });

    describe('invalid monitor data', () => {
        it('should ignore empty clipboard contents', async () => {
            const clipboardSpy = jest.spyOn(env.clipboard, "readText").mockResolvedValueOnce("");
            const editorSpy = jest.spyOn(mockEditor, "edit");
    
            await pasteMonitor(mockEditor, mockParser);
    
            expect(clipboardSpy).toHaveBeenCalled();
            expect(editorSpy).not.toHaveBeenCalled();
        });

        it('should notify on exception', async () => {
            const spy = jest.spyOn(mockParser, "parse").mockImplementationOnce(() => { throw new SyntaxError("fake") });

            await pasteMonitor(mockEditor, mockParser);

            expect(spy).toHaveBeenCalled();
            expect(window.showErrorMessage).toBeCalledWith(ConversionErrorMessage);
        });
    });

    describe('valid monitor data', () => {
        it('should edit text editor contents', async () => {
            const spy = jest.spyOn(mockEditor, "edit");

            await pasteMonitor(mockEditor, mockParser);

            expect(spy).toHaveBeenCalled();
        });

        it('should insert when no text is selected', async () => {
            const spy = jest.spyOn(mockEditor, "edit");
            await pasteMonitor(mockEditor, mockParser);
            const callback = spy.mock.calls[0][0];
            
            callback(mockTextEditorEdit);

            expect(mockTextEditorEdit.insert).toHaveBeenCalledWith(mockEditor.selection.start, expect.anything());
        });

        it('should replace when text is selected', async () => {
            mockEditor.selection.isEmpty = false;
            const spy = jest.spyOn(mockEditor, "edit");
            await pasteMonitor(mockEditor, mockParser);
            const callback = spy.mock.calls[0][0];
            
            callback(mockTextEditorEdit);

            expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(mockEditor.selection, expect.anything());
        });
    });
});

class MockParser implements IParser {
    setIndentSize(_indentSize: number): void {};
    setOnValidationErrors(_callback: (errors: string[]) => void): void {};
    parse(json: string): string { return json };
}