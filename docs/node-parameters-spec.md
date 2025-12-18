# Node Parameters Specification (Based on N8N Architecture)

## Overview
This document defines the complete parameter system for workflow nodes, based on n8n's architecture.

## 1. Node-Level Settings (Universal - Applied to ALL Nodes)

These settings are configured on each node instance and control execution behavior:

### Error Handling
```typescript
{
  continueOnFail: boolean;        // Continue workflow if this node fails (default: false)
  onError: "stopWorkflow" | "continueRegularOutput" | "continueErrorOutput";
  retryOnFail: boolean;           // Enable automatic retries (default: false)
  maxTries: number;               // Maximum retry attempts (1-5, default: 3)
  waitBetweenTries: number;       // Milliseconds between retries (0-5000, default: 1000)
}
```

### Data & Execution
```typescript
{
  alwaysOutputData: boolean;      // Output data even with empty results (default: false)
  executeOnce: boolean;           // Run once for all items vs per item (default: false)
  timeout: number;                // Maximum execution time in seconds (default: 3600)
  disabled: boolean;              // Skip this node during execution (default: false)
}
```

### UI & Metadata
```typescript
{
  notes: string;                  // User notes/comments for this node
  notesInFlow: boolean;           // Show notes on canvas (default: false)
  color: number;                  // Node color in UI (0-7)
  position: [number, number];     // X, Y coordinates on canvas
  parameters: Record<string, any>; // Node-specific configuration values
}
```

## 2. Node Type Definitions (Schema-Level)

Standard parameters from INodeTypeDescription:

```typescript
{
  displayName: string;            // Human-readable name (e.g., "OpenAI Chat")
  name: string;                   // Internal identifier (e.g., "openaiChat")
  group: string[];                // Categories (e.g., ["transform", "ai"])
  version: number | number[];     // Node version(s)
  description: string;            // What this node does
  icon: string;                   // Icon file or emoji
  iconColor?: string;             // Icon background color

  inputs: string[];               // Input port names
  outputs: string[];              // Output port names

  credentials?: Array<{
    name: string;                 // Credential type name
    required: boolean;            // Is this credential required?
    displayOptions?: {            // When to show this credential
      show: Record<string, any>;
    };
  }>;

  properties: INodeProperties[];  // Configuration fields (see section 3)
}
```

## 3. Node Properties (INodeProperties)

Configuration fields shown in the node settings panel:

### Field Definition
```typescript
interface INodeProperties {
  displayName: string;            // Label shown to user
  name: string;                   // Internal field name
  type: FieldType;                // UI component type (see below)
  default: any;                   // Default value
  required?: boolean;             // Is this field required?
  description?: string;           // Help text
  placeholder?: string;           // Placeholder text

  // Conditional display
  displayOptions?: {
    show?: Record<string, any[]>; // Show when these conditions match
    hide?: Record<string, any[]>; // Hide when these conditions match
  };

  // Type-specific options
  options?: Array<{               // For 'options' and 'multiOptions' types
    name: string;
    value: any;
    description?: string;
  }>;

  typeOptions?: {
    minValue?: number;            // For 'number' type
    maxValue?: number;
    numberStepSize?: number;
    numberPrecision?: number;

    rows?: number;                // For 'string' type (multiline)
    password?: boolean;           // Mask input

    loadOptionsMethod?: string;   // Dynamic options loader
    loadOptionsDependsOn?: string[];
  };
}
```

### Field Types
```typescript
type FieldType =
  | "string"          // Text input
  | "number"          // Number input
  | "boolean"         // Checkbox
  | "options"         // Dropdown (single select)
  | "multiOptions"    // Multi-select dropdown
  | "collection"      // Nested fields group
  | "fixedCollection" // Structured array
  | "json"            // JSON editor
  | "dateTime"        // Date/time picker
  | "color"           // Color picker
  | "hidden"          // Hidden field
  | "notice";         // Info/warning message
```

## 4. Example: Complete Node Definition

```json
{
  "displayName": "OpenAI Chat",
  "name": "openaiChat",
  "group": ["ai", "transform"],
  "version": 1,
  "description": "Interact with OpenAI's GPT models",
  "icon": "file:openai.svg",
  "iconColor": "#10A37F",

  "inputs": ["main"],
  "outputs": ["main"],

  "credentials": [
    {
      "name": "openaiApi",
      "required": true
    }
  ],

  "properties": [
    {
      "displayName": "Model",
      "name": "model",
      "type": "options",
      "default": "gpt-4-turbo",
      "required": true,
      "description": "The model to use for completion",
      "options": [
        {
          "name": "GPT-4 Turbo",
          "value": "gpt-4-turbo",
          "description": "Most capable model, best for complex tasks"
        },
        {
          "name": "GPT-4",
          "value": "gpt-4",
          "description": "Previous generation GPT-4"
        },
        {
          "name": "GPT-3.5 Turbo",
          "value": "gpt-3.5-turbo",
          "description": "Fast and efficient for simpler tasks"
        }
      ]
    },
    {
      "displayName": "Temperature",
      "name": "temperature",
      "type": "number",
      "default": 0.7,
      "required": false,
      "description": "Sampling temperature (0-2). Higher = more random.",
      "typeOptions": {
        "minValue": 0,
        "maxValue": 2,
        "numberStepSize": 0.1,
        "numberPrecision": 1
      }
    },
    {
      "displayName": "Max Tokens",
      "name": "maxTokens",
      "type": "number",
      "default": 1000,
      "description": "Maximum tokens in response",
      "typeOptions": {
        "minValue": 1,
        "maxValue": 4096
      }
    },
    {
      "displayName": "System Prompt",
      "name": "systemPrompt",
      "type": "string",
      "default": "",
      "description": "System message to set behavior",
      "typeOptions": {
        "rows": 3
      }
    },
    {
      "displayName": "Response Format",
      "name": "responseFormat",
      "type": "options",
      "default": "text",
      "options": [
        {
          "name": "Text",
          "value": "text"
        },
        {
          "name": "JSON",
          "value": "json"
        }
      ],
      "displayOptions": {
        "show": {
          "model": ["gpt-4-turbo", "gpt-3.5-turbo"]
        }
      }
    }
  ]
}
```

## 5. Node Instance Example (Saved in Workflow)

```json
{
  "id": "node-abc123",
  "name": "openaiChat",
  "type": "ai",
  "typeVersion": 1,
  "position": [250, 300],
  "
": {
    "model": "gpt-4-turbo",
    "temperature": 0.8,
    "maxTokens": 2000,
    "systemPrompt": "You are a helpful assistant",
    "responseFormat": "json"
  },
  "settings": {
    "continueOnFail": false,
    "retryOnFail": true,
    "maxTries": 3,
    "waitBetweenTries": 1000,
    "alwaysOutputData": false,
    "timeout": 60,
    "notes": "Main AI processing node",
    "notesInFlow": true,
    "color": 4
  }
}
```

## 6. Implementation Priorities

### Phase 1: Core Settings (CURRENT - DONE ✅)
- ✅ Node parameters (api_key, model, temperature, etc.)
- ✅ Basic persistence and loading
- ✅ Dynamic form rendering from schema

### Phase 2: Node-Level Settings (NEXT)
- [ ] Error handling (continueOnFail, retryOnFail, maxTries, waitBetweenTries)
- [ ] Data options (alwaysOutputData, executeOnce)
- [ ] Execution (timeout, disabled)
- [ ] UI (notes, notesInFlow, color)

### Phase 3: Advanced Features
- [ ] Conditional field display (displayOptions)
- [ ] Dynamic options loading (loadOptionsMethod)
- [ ] Credentials management system
- [ ] Expression editor for dynamic values
- [ ] Multi-version node support

### Phase 4: Execution Engine
- [ ] Implement retry logic
- [ ] Implement error handling workflows
- [ ] Implement timeout enforcement
- [ ] Implement continueOnFail behavior

## References

- [n8n Standard Parameters](https://docs.n8n.io/integrations/creating-nodes/build/reference/node-base-files/standard-parameters/)
- [n8n Error Handling](https://docs.n8n.io/flow-logic/error-handling/)
- [n8n Custom Node Development](https://community.n8n.io/t/custom-node-continueonfail/1174)
- [n8n HTTP Request Node - Error Handling Options](https://github.com/n8n-io/n8n/issues/9236)
