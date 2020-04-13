import { Validator, Schema, ValidatorResult } from 'jsonschema';

export interface IMonitorValidator {
    validate(json: object): ValidatorResult
}

export class MonitorValidator implements IMonitorValidator {

    private monitorSchemaId = "/monitorschema";
    private optionsSchemaId = "/optionsschema";
    private metricThresholdsSchemaId = "/metricthresholdsschema";
    private serviceThresholdsSchemaId = "/servicethresholdsschema";

    private monitorSchema: Schema = {
        id: this.monitorSchemaId,
        type: "object",
        required: ["name", "type", "query", "message"],
        additionalProperties: false,
        properties: {
            id: {
                type: "number"
            },
            name: {
                type: "string"
            },
            type: {
                type: "string",
                pattern: "^(metric alert|service check|event alert|query alert|composite|log alert)$"
            },
            query: {
                type: "string"
            },
            message: {
                type: "string"
            },
            tags: {
                type: "array",
                items: {
                    type: "string"
                }
            },
            options: {
                $ref: this.optionsSchemaId
            },
            restricted_roles: {}
        }
    };

    private metricThresholdsSchema: Schema = {
        id: this.metricThresholdsSchemaId,
        type: "object",
        required: ["critical", "critical_recovery", "warning", "warning_recovery"],
        additionalProperties: false,
        properties: {
            critical: {
                type: "number"
            },
            critical_recovery: {
                type: "number"
            },
            warning: {
                type: "number"
            },
            warning_recovery: {
                type: "number"
            }
        }
    };
    
    private servicethresholdsSchema: Schema = {
        id: this.serviceThresholdsSchemaId,
        type: "object",
        required: ["ok", "critical", "warning", "unknown"],
        additionalProperties: false,
        properties: {
            ok: {
                type: "integer"
            },
            critical: {
                type: "integer"
            },
            warning: {
                type: "integer"
            },
            unknown: {
                type: "integer"
            }
        }
    };
    
    private optionsSchema: Schema = {
        id: this.optionsSchemaId,
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
            notify_audit: {
                type: "boolean"
            },
            locked: {
                type: "boolean"
            },
            timeout_h: {
                type: "integer"
            },
            new_host_delay: {
                type: "integer"
            },
            require_full_window: {
                type: "boolean"
            },
            notify_no_data: {
                type: "boolean"
            }, 
            renotify_interval: {
                type: "string", //should be an integer but the Datadog export returns a string
                pattern: "^\\d+$"
            },
            escalation_message: {
                type: "string"
            }, 
            no_data_timeframe: {
                type: ["integer", "null"]
            },
            include_tags: {
                type: "boolean"
            },
            evaluation_delay: {
                type: "integer"
            }, 
            enable_logs_sample: {
                type: "boolean"
            },
            thresholds: {
                oneOf: [this.metricThresholdsSchema, this.servicethresholdsSchema]
            }
        }
    };

    private validator: Validator;

    public constructor() {
        this.validator = new Validator();
        this.validator.addSchema(this.metricThresholdsSchema, this.metricThresholdsSchemaId);
        this.validator.addSchema(this.servicethresholdsSchema, this.serviceThresholdsSchemaId);
        this.validator.addSchema(this.optionsSchema, this.optionsSchemaId);
    };

    public validate(json: object): ValidatorResult {
        return this.validator.validate(json, this.monitorSchema);
    };
}