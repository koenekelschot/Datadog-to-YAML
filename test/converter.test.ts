import { safeDump } from "js-yaml";
import { toYaml } from "../src/converter";

jest.mock("js-yaml");

describe("toYaml", () => {
    it ("should convert JSON input to YAML", () => {
        toYaml({}, 2);
        expect(safeDump).toHaveBeenCalled();
    });

    it ("should remove \"id\" property from input", () => {
        const input = { id: 42, value: "Test" };
        const expected = JSON.parse(JSON.stringify(input));
        delete expected.id;
        
        toYaml(input, 2);
        
        expect(safeDump).toHaveBeenCalledWith(expected, { indent: 2 });
    });

    it ("should indent output with indentSize", () => {
        const indent = 6;
        toYaml({}, indent);
        expect(safeDump).toHaveBeenCalledWith({}, { indent: indent });
    });
});