import { Validator, Schema } from 'jsonschema';

const monitorSchemaId = "/monitorschema";
const optionsSchemaId = "/optionsschema";
const metricThresholdsSchemaId = "/metricthresholdsschema";
const serviceThresholdsSchemaId = "/servicethresholdsschema";

const monitorSchema: Schema = {
    id: monitorSchemaId,
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
            $ref: optionsSchemaId
        },
        restricted_roles: {}
    }
}

const metricThresholdsSchema: Schema = {
    id: metricThresholdsSchemaId,
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
}

const servicethresholdsSchema: Schema = {
    id: serviceThresholdsSchemaId,
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
}

const optionsSchema: Schema = {
    id: optionsSchemaId,
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
            oneOf: [metricThresholdsSchema, servicethresholdsSchema]
        }
    }
}

export function isValidMonitorJSON(input: string): boolean {
    let jsonObject = JSON.parse(input);

    const validator = new Validator();
    validator.addSchema(metricThresholdsSchema, metricThresholdsSchemaId);
    validator.addSchema(servicethresholdsSchema, serviceThresholdsSchemaId);
    validator.addSchema(optionsSchema, optionsSchemaId);
    
    const results = validator.validate(jsonObject, monitorSchema);
    console.log(results);

    return false;
}