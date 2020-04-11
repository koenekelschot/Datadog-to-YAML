import { safeDump } from 'js-yaml';

export function convertToYaml(content: string, indentSize: number): string {
    let jsonObject = JSON.parse(content);
    
    if (Object.keys(jsonObject).indexOf("id") > -1) {
        delete jsonObject.id;
    }

    const converted = safeDump(jsonObject, {indent: indentSize});
    return converted;
}