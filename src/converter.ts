import { safeDump } from 'js-yaml';

export function convertToYaml(content: string, indentSize: number): string {
    const cleaned = cleanInput(content);
    let jsonObject = JSON.parse(cleaned);
    if (Object.keys(jsonObject).indexOf("id") > -1) {
        delete jsonObject.id;
    }

    const converted = safeDump(jsonObject, {indent: indentSize});
    return converted;
}

function cleanInput(input: string): string {
    let output = "";
    input.split(/\r?\n/).forEach(line => output += line.trim());
    return output;
}