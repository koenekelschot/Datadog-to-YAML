import { IMonitorValidator, MonitorValidator } from "./monitorValidator";
import { sanitize } from "./sanitizer";
import { toYaml } from "./converter";

export interface IParser {
    setIndentSize(indentSize: number): void
    setOnError(callback: (errors: string[]) => void): void;
    parse(json: string): string | null;
}

export class Parser implements IParser {
    private indentSize: number = 2;
    private onError: ((errors: string[]) => void) | undefined;
    private validator: IMonitorValidator;

    public constructor() {
        this.validator = new MonitorValidator();
    };

    public setIndentSize(indentSize: number): void {
        this.indentSize = indentSize;
    };

    public setOnError(callback: (errors: string[]) => void): void {
        this.onError = callback;
    };

    public parse(json: string): string | null {
        const sanitized = sanitize(json);
        const monitor = JSON.parse(sanitized);
        const results = this.validator.validate(monitor);

        if (!results.valid) {
            if (this.onError) {
                this.onError(results.errors.map(err => err.message));
            }
            
            return null;
        }

        return toYaml(monitor, this.indentSize);
    };
}