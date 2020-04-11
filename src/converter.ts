import { safeDump } from 'js-yaml';

export function toYaml(json: any, indentSize: number): string {
    if (Object.keys(json).indexOf("id") > -1) {
        delete json.id;
    }

    return safeDump(json, {indent: indentSize});
}