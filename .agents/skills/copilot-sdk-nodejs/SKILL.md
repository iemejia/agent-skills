---
name: copilot-sdk-nodejs
description: Build Node.js/TypeScript applications using the GitHub Copilot SDK (@github/copilot-sdk). Use when the user asks to create, debug, or work with Copilot SDK clients, sessions, tools, streaming, events, BYOK providers, or any programmatic integration with GitHub Copilot in Node.js or TypeScript.
---

# GitHub Copilot SDK — Node.js / TypeScript

## Core Principles

- The SDK is in technical preview and may have breaking changes
- Requires Node.js 18.0 or later
- Requires GitHub Copilot CLI installed and in PATH
- Built with TypeScript for type safety
- Uses async/await patterns throughout
- Provides full TypeScript type definitions

## Installation

```bash
npm install @github/copilot-sdk
# or
pnpm add @github/copilot-sdk
# or
yarn add @github/copilot-sdk
```

## Client Initialization

### Basic Client Setup

```typescript
import { CopilotClient, approveAll } from "@github/copilot-sdk";

const client = new CopilotClient();
await client.start();
// Use client...
await client.stop();
```

### Client Configuration Options

`CopilotClientOptions`:

- `cliPath` - Path to CLI executable (default: "copilot" from PATH)
- `cliArgs` - Extra arguments prepended before SDK-managed flags (string[])
- `cliUrl` - URL of existing CLI server (e.g., "localhost:8080"). When provided, client won't spawn a process
- `port` - Server port (default: 0 for random)
- `useStdio` - Use stdio transport instead of TCP (default: true)
- `logLevel` - Log level (default: "debug")
- `autoStart` - Auto-start server (default: true)
- `autoRestart` - Auto-restart on crash (default: true)
- `cwd` - Working directory for the CLI process (default: process.cwd())
- `env` - Environment variables for the CLI process (default: process.env)

### Manual Server Control

```typescript
const client = new CopilotClient({ autoStart: false });
await client.start();
// Use client...
await client.stop();
```

Use `forceStop()` when `stop()` takes too long.

## Session Management

### Creating Sessions

```typescript
const session = await client.createSession({
    onPermissionRequest: approveAll,
    model: "gpt-5",
    streaming: true,
    tools: [...],
    systemMessage: { ... },
    availableTools: ["tool1", "tool2"],
    excludedTools: ["tool3"],
    provider: { ... }
});
```

### Session Config Options

- `sessionId` - Custom session ID (string)
- `model` - Model name ("gpt-5", "claude-sonnet-4.5", etc.)
- `tools` - Custom tools exposed to the CLI (Tool[])
- `systemMessage` - System message customization (SystemMessageConfig)
- `availableTools` - Allowlist of tool names (string[])
- `excludedTools` - Blocklist of tool names (string[])
- `provider` - Custom API provider configuration (BYOK) (ProviderConfig)
- `streaming` - Enable streaming response chunks (boolean)
- `mcpServers` - MCP server configurations (MCPServerConfig[])
- `customAgents` - Custom agent configurations (CustomAgentConfig[])
- `configDir` - Config directory override (string)
- `skillDirectories` - Skill directories (string[])
- `disabledSkills` - Disabled skills (string[])
- `onPermissionRequest` - Permission request handler (PermissionHandler)

### Resuming Sessions

```typescript
const session = await client.resumeSession("session-id", {
  tools: [myNewTool],
  onPermissionRequest: approveAll,
});
```

### Session Operations

- `session.sessionId` - Get session identifier (string)
- `await session.send({ prompt: "...", attachments: [...] })` - Send message, returns Promise\<string\>
- `await session.sendAndWait({ prompt: "..." }, timeout)` - Send and wait for idle, returns Promise\<AssistantMessageEvent | null\>
- `await session.abort()` - Abort current processing
- `await session.getMessages()` - Get all events/messages, returns Promise\<SessionEvent[]\>
- `await session.destroy()` - Clean up session

## Event Handling

### Event Subscription Pattern

ALWAYS use async/await or Promises for waiting on session events:

```typescript
await new Promise<void>((resolve) => {
  session.on((event) => {
    if (event.type === "assistant.message") {
      console.log(event.data.content);
    } else if (event.type === "session.idle") {
      resolve();
    }
  });
  session.send({ prompt: "..." });
});
```

### Unsubscribing from Events

The `on()` method returns an unsubscribe function:

```typescript
const unsubscribe = session.on((event) => { /* handler */ });
unsubscribe();
```

### Event Types

Use discriminated unions with type guards:

```typescript
session.on((event) => {
  switch (event.type) {
    case "user.message": break;
    case "assistant.message": console.log(event.data.content); break;
    case "tool.executionStart": break;
    case "tool.executionComplete": break;
    case "session.start": break;
    case "session.idle": break;
    case "session.error": console.error(event.data.message); break;
  }
});
```

## Streaming Responses

Enable with `streaming: true` in SessionConfig. Handle both delta and final events:

```typescript
session.on((event) => {
  switch (event.type) {
    case "assistant.message_delta":
      process.stdout.write(event.data.deltaContent); break;
    case "assistant.reasoning_delta":
      process.stdout.write(event.data.deltaContent); break;
    case "assistant.message":
      console.log(event.data.content); break;
    case "assistant.reasoning":
      console.log(event.data.content); break;
    case "session.idle": break;
  }
});
```

Final events (`assistant.message`, `assistant.reasoning`) are ALWAYS sent regardless of streaming setting.

## Custom Tools

### defineTool (JSON Schema)

```typescript
import { defineTool } from "@github/copilot-sdk";

defineTool({
  name: "lookup_issue",
  description: "Fetch issue details from tracker",
  parameters: {
    type: "object",
    properties: { id: { type: "string", description: "Issue ID" } },
    required: ["id"],
  },
  handler: async (args) => {
    return await fetchIssue(args.id);
  },
})
```

### defineTool (Zod)

```typescript
import { z } from "zod";
import { defineTool } from "@github/copilot-sdk";

defineTool({
  name: "get_weather",
  description: "Get weather for a location",
  parameters: z.object({
    location: z.string().describe("City name"),
    units: z.enum(["celsius", "fahrenheit"]).optional(),
  }),
  handler: async (args) => {
    return { temperature: 72, units: args.units || "fahrenheit" };
  },
})
```

### Tool Return Types

- Return any JSON-serializable value (automatically wrapped)
- Or return `ToolResultObject` for full control:

```typescript
{ textResultForLlm: string; resultType: "success" | "failure"; error?: string; toolTelemetry?: Record<string, unknown>; }
```

## System Message Customization

### Append Mode (default — preserves guardrails)

```typescript
systemMessage: { mode: "append", content: "Additional instructions..." }
```

### Replace Mode (full control — removes guardrails)

```typescript
systemMessage: { mode: "replace", content: "You are a helpful assistant." }
```

## File Attachments

```typescript
await session.send({
  prompt: "Analyze this file",
  attachments: [{ type: "file", path: "/path/to/file.ts", displayName: "My File" }],
});
```

## Message Delivery Modes

- `"enqueue"` - Queue message for processing
- `"immediate"` - Process message immediately

## Multiple Sessions

Sessions are independent and can run concurrently. See [multiple-sessions recipe](references/multiple-sessions.md).

## Bring Your Own Key (BYOK)

```typescript
const session = await client.createSession({
  onPermissionRequest: approveAll,
  provider: { type: "openai", baseUrl: "https://api.openai.com/v1", apiKey: "your-api-key" },
});
```

## Session Lifecycle Management

```typescript
const sessions = await client.listSessions();           // List all sessions
await client.deleteSession(sessionId);                   // Delete a session
const lastId = await client.getLastSessionId();          // Get last session ID
const state = client.getState();                         // "disconnected" | "connecting" | "connected" | "error"
```

## Resource Cleanup

ALWAYS use try-finally:

```typescript
const client = new CopilotClient();
try {
  await client.start();
  const session = await client.createSession({ onPermissionRequest: approveAll });
  try {
    // Use session...
  } finally {
    await session.destroy();
  }
} finally {
  await client.stop();
}
```

### Cleanup Helper Pattern

```typescript
async function withClient<T>(fn: (client: CopilotClient) => Promise<T>): Promise<T> {
  const client = new CopilotClient();
  try { await client.start(); return await fn(client); }
  finally { await client.stop(); }
}

async function withSession<T>(client: CopilotClient, fn: (session: CopilotSession) => Promise<T>): Promise<T> {
  const session = await client.createSession({ onPermissionRequest: approveAll });
  try { return await fn(session); }
  finally { await session.destroy(); }
}
```

## Connectivity Testing

```typescript
const response = await client.ping("health check");
```

## TypeScript Features

### Type Inference

```typescript
import type { SessionEvent, AssistantMessageEvent } from "@github/copilot-sdk";

session.on((event: SessionEvent) => {
  if (event.type === "assistant.message") {
    const content: string = event.data.content; // narrowed
  }
});
```

### Generic Event Helper

```typescript
async function waitForEvent<T extends SessionEvent["type"]>(
  session: CopilotSession, eventType: T,
): Promise<Extract<SessionEvent, { type: T }>> {
  return new Promise((resolve) => {
    const unsubscribe = session.on((event) => {
      if (event.type === eventType) { unsubscribe(); resolve(event as any); }
    });
  });
}
```

## Best Practices

1. Always use try-finally for resource cleanup
2. Use Promises to wait for session.idle event
3. Handle session.error events for robust error handling
4. Use type guards or switch statements for event handling
5. Enable streaming for better UX in interactive scenarios
6. Use defineTool for type-safe tool definitions
7. Use Zod schemas for runtime parameter validation
8. Dispose event subscriptions when no longer needed
9. Use systemMessage with mode: "append" to preserve safety guardrails
10. Handle both delta and final events when streaming is enabled
11. Leverage TypeScript types for compile-time safety

## Cookbook Recipes

For practical, copy-pasteable examples, see the references:

- [Error Handling](references/error-handling.md): Connection failures, timeouts, abort, graceful shutdown
- [Multiple Sessions](references/multiple-sessions.md): Parallel conversations, custom IDs, listing/deleting
- [Managing Local Files](references/managing-local-files.md): AI-powered file organization by metadata
- [PR Visualization](references/pr-visualization.md): Interactive PR age charts using GitHub MCP Server
- [Persisting Sessions](references/persisting-sessions.md): Save and resume sessions across restarts
