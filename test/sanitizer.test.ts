import { sanitize } from "../src/sanitizer";
import { fail } from "assert";

describe('sanitizer', () => {
    it ('should remove leading whitespace', () => {
        const result = "This has no leading whitespace";
        expect(sanitize(`  ${result}`)).toBe(result);
    });

    it ('should remove trailing whitespace', () => {
        const result = "This has no leading whitespace";
        expect(sanitize(`${result}  `)).toBe(result);
    });

    it ('should remove new lines', () => {
        const input = `This
has
no
new
lines`;
        expect(sanitize(input)).toBe("Thishasnonewlines");
    });
});