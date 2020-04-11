export function sanitize(input: string): string {
    let output = "";
    input.split(/\r?\n/).forEach(line => output += line.trim());
    return output;
}