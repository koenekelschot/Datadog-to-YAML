import yaml = require('js-yaml');

export function convertToYaml(content: string, indentSize: number): string {
    const cleaned = cleanInput(content);
    console.log(cleaned);
    let jsonObject = JSON.parse(cleaned);
    if (Object.keys(jsonObject).indexOf("id") > -1) {
        delete jsonObject.id;
    }

    const converted = yaml.safeDump(jsonObject, {indent: indentSize});
    return converted;
}

function cleanInput(input: string): string {
    let output = "";
    input.split(/\r?\n/).forEach(line => output += line.trim());
    return output;
}