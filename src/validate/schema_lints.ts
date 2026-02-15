import { Finding, ToolDescriptor } from '../mcp/types.js';

function asObject(input: unknown): Record<string, unknown> {
  return typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {};
}

export function runSchemaLints(tools: ToolDescriptor[]): Finding[] {
  const findings: Finding[] = [];

  for (const tool of tools) {
    const schema = asObject(tool.inputSchema);
    const properties = asObject(schema.properties);

    if (Object.keys(properties).length === 0) {
      findings.push({
        severity: 'medium',
        ruleId: 'schema.empty_properties',
        message: `Tool ${tool.name} does not declare input properties`,
        evidence: JSON.stringify(tool.inputSchema),
        remediation: 'Add explicit JSON Schema properties and constraints.',
        toolName: tool.name
      });
    }

    for (const [name, raw] of Object.entries(properties)) {
      const prop = asObject(raw);
      if (prop.type === 'string' && !('maxLength' in prop) && !('enum' in prop) && !('pattern' in prop)) {
        findings.push({
          severity: 'low',
          ruleId: 'schema.unbounded_string',
          message: `Parameter ${name} on tool ${tool.name} is an unconstrained string`,
          evidence: JSON.stringify(prop),
          remediation: 'Add maxLength, enum, or pattern constraints.',
          toolName: tool.name
        });
      }
      if (prop.type === 'array' && !('maxItems' in prop)) {
        findings.push({
          severity: 'medium',
          ruleId: 'schema.unbounded_array',
          message: `Parameter ${name} on tool ${tool.name} is an unbounded array`,
          evidence: JSON.stringify(prop),
          remediation: 'Add maxItems and constrain item values.',
          toolName: tool.name
        });
      }
    }
  }

  return findings;
}
