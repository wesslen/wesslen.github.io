---
title: "Google ADK and the A2A Protocol: A Technical Reference"
date: 2026-04-04
description: "A deep-dive into Google's Agent Development Kit and the Agent2Agent protocol — the six core primitives, the cooperative event loop, how agents communicate across frameworks, and where the abstraction lines actually sit."
tags: [GenAI, agentic-engineering, multi-agent, protocols]
---

> **TL;DR:** Google ADK and the A2A protocol are the most coherent framework-plus-protocol proposal I've seen for the multi-agent problem. ADK provides six core primitives — Agent, Runner, Session, Event, Artifact, Tool — and a cooperative event loop that makes state management predictable across complex agent hierarchies. A2A handles cross-framework interoperability through Agent Cards, a stateful Task lifecycle, and three communication modes, all built on standard HTTP and JSON-RPC rather than proprietary infrastructure. What neither addresses is the application-layer trust problem: A2A tells you who you're talking to; it doesn't tell you whether the remote agent will behave safely under adversarial inputs, and that's still the hard part.

What does it take to build a multi-agent system that doesn't collapse into a pile of bespoke glue code the moment you add a third agent or cross a vendor boundary? Related to the guardrails post, I've been thinking about where I mentioned almost in passing that the agent-to-agent attack surface was still largely unsolved. I wanted to actually understand the machinery before I wrote more about the risk.

This is my working-through of two Google releases: the [Agent Development Kit (ADK)](https://adk.dev/), an open-source framework for building stateful agents, and the [Agent2Agent (A2A) protocol](https://a2a-protocol.org/), an open standard for framework-agnostic agent communication. They were designed to work together, but understanding each one individually first is worth the effort.

## What ADK is

ADK is a code-first framework for building, evaluating, and deploying AI agents. The "code-first" framing is deliberate — no drag-and-drop builders, no proprietary DSLs, just Python and explicit control.[^1] You install it with `pip install google-adk` and you're working with regular Python classes, async generators, and typed objects throughout.

It's model-agnostic in practice. Optimized for Gemini, but you can route through Claude, Ollama, and most other providers via LiteLLM or the `BaseLlm` interface. It's deployment-agnostic too — same code runs locally, on Cloud Run, on GKE, or in Vertex AI Agent Engine.

The design philosophy Google has landed on is worth quoting directly: **build with ADK, equip with MCP, communicate with A2A.** That's the intended stack. ADK as the construction framework, MCP for connecting agents to tools and data sources, A2A for connecting agents to each other.

## Six core primitives

ADK's architecture revolves around six primitives. Everything else is built on top of these.

**Agent** (`BaseAgent`) is the fundamental execution unit. All agent types inherit from it and implement `_run_async_impl()` — an async generator that yields `Event` objects. The generator-based design is what makes the cooperative event loop work.

**Runner** (`google.adk.runners.Runner`) orchestrates execution. It manages the event loop, coordinates the three backend services (session, artifact, memory), and is the entry point for every invocation.

**Session** is a single conversation thread — a unique ID, an `app_name`, a `user_id`, a dict-like state scratchpad, and a chronological list of events. It's the shared working memory for everything that happens within one interaction.

**Event** (`google.adk.events.Event`) is the atomic communication unit. Every event carries an `author` (which agent produced it), `content` (text, function calls, or responses), and an `actions` field (`EventActions`) that can contain `state_delta`, `artifact_delta`, `transfer_to_agent`, or `escalate`. State changes are carried as deltas on events — they're not mutations applied directly to session state.

**Artifact** is named, versioned binary data — PDFs, images, files — stored as `google.genai.types.Part` objects and managed by the `ArtifactService`. Each `save_artifact` call auto-increments the version number.

**Tool** is any function or capability an agent can invoke: custom Python functions, other agents, built-in tools (Google Search, code execution), MCP endpoints, or imported OpenAPI specs.

## Five agent types

ADK ships with five agent types that cover the range from fully deterministic to fully LLM-driven.

**LlmAgent** (also aliased as just `Agent`) is the LLM-powered type. It accepts a `model`, `instructions` (with `{state_key}` templating for injecting session state into the prompt), a list of `tools`, a list of `sub_agents`, and callbacks. The `output_key` parameter is how you wire agents together in a pipeline — the agent's final response text is written to `session.state[output_key]` automatically, and downstream agents can reference it with `{output_key}` in their instructions.

**SequentialAgent** runs sub-agents one at a time, in strict order, fully deterministically. No LLM involved in the flow control. Data passes between sub-agents through shared session state.

**ParallelAgent** runs all sub-agents concurrently. Events may interleave, which matters for anything that logs or reacts to event order. Each child shares `session.state`, so use distinct state keys — if two children write to the same key, you'll get a race condition.

**LoopAgent** repeatedly executes its sub-agents until either `max_iterations` is reached or a sub-agent signals `escalate=True` via `EventActions`. That escalate signal is how you break out of a loop based on agent judgment rather than a fixed count.

**CustomAgent** inherits directly from `BaseAgent` and lets you implement `_run_async_impl()` yourself. This is the escape hatch for workflows that don't fit the built-in patterns — conditional branching based on runtime state, dynamic sub-agent selection, or any orchestration logic that requires real code.

## The cooperative event loop

The event loop is the thing I spent the most time understanding, because getting it wrong produces subtle bugs that only surface under load or in multi-agent hierarchies.

The eight-step cycle:

1. User input arrives — `runner.run_async(user_id, session_id, new_message)` is called
2. Runner appends the user message as an `Event` via `SessionService`
3. Runner calls `agent.run_async(invocation_context)`, receiving an async generator
4. Agent yields an `Event` — execution pauses at this yield point
5. Runner commits the event (including any `state_delta` and `artifact_delta`) via `session_service.append_event()`
6. Runner yields the event upstream to the caller (UI, API, parent agent)
7. Agent resumes — it can now reliably read any state it just wrote
8. Cycle repeats until the generator is exhausted

The critical implication is about ordering: **state changes are only guaranteed persisted after the carrying event has been yielded and processed by the Runner.** An agent that writes to state and then immediately reads that same key in the next line — before yielding — is reading its own unpercolated change. Events with `partial=True` (streaming tokens) are forwarded to callers but may not be committed to the session store.

```python
# The Runner orchestrates everything
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

runner = Runner(
    agent=root_agent,
    app_name="my_app",
    session_service=InMemorySessionService()
)

async for event in runner.run_async(
    user_id="ryan",
    session_id="session_001",
    new_message=types.Content(role="user", parts=[types.Part(text="Hello")])
):
    if event.is_final_response():
        print(event.content.parts[0].text)
```

## Tools

Custom function tools are plain Python functions. ADK auto-wraps them as `FunctionTool`, using the function name, docstring, parameter types, and return type annotation to generate the JSON schema that goes to the model. The simplest version looks exactly like writing any other Python function.

```python
def check_account_balance(account_id: str, currency: str = "USD") -> dict:
    """Retrieve the current balance for a given account."""
    # ... implementation
    return {"balance": 1250.00, "currency": currency}
```

Adding `tool_context: ToolContext` as the last parameter upgrades the tool to have access to session state, artifacts, memory, and credential management — without changing the function signature from the model's perspective.

Built-in tools (Google Search, `BuiltInCodeExecutor`, Vertex AI Search) work at the Gemini API level and generally can't be mixed with other tools in the same agent. The workaround is wrapping them in a dedicated sub-agent and using that sub-agent as an `AgentTool` from the parent. It's an extra layer, but it keeps the tool call graphs clean.

MCP integrations use `McpToolset`. OpenAPI integrations can be imported directly from specs. Both get treated as first-class tools from the agent's perspective.

> [!NOTE]
> The built-in tool mixing limitation is a real constraint if you're trying to combine Google Search with custom tools in a single agent. Wrapping the built-in in a sub-agent is the officially supported pattern, but it means your orchestrator has to manage one more sub-agent in its hierarchy.

## Sessions, state, and memory

Three `SessionService` implementations: `InMemorySessionService` for development and testing, `DatabaseSessionService` for SQLite/PostgreSQL/MySQL, and `VertexAiSessionService` for production.

State scoping uses key prefixes, and this is one of the more elegant design choices in ADK:

- No prefix: session-scoped — persists within the current session only
- `app:` prefix: application-scoped — shared across all sessions and all users
- `user:` prefix: user-scoped — shared across all sessions for a specific user
- `temp:` prefix: invocation-scoped — discarded after the request-response cycle

The security implication is real. App-scoped state (`app:max_credit_limit`) can be written at configuration time and read by any session, but individual sessions can't override it — it's write-restricted to higher-privilege operations. That's the pattern for injecting policy constraints that individual users shouldn't be able to manipulate.

State must always be modified through context objects — `callback_context.state`, `tool_context.state` — never directly on a retrieved `Session` object. The framework tracks changes through `EventActions.state_delta`, and direct mutation bypasses that tracking.

Long-term memory is an optional `MemoryService` layer on top of sessions. `InMemoryMemoryService` for development; `VertexAiMemoryBankService` for production with semantic search. Agents access it through a `load_memory` tool, which lets them query across past sessions by semantic similarity rather than exact key lookup.

## Artifacts

Artifacts are how agents handle binary content — PDFs, images, generated reports, anything that doesn't fit in a text state value. They live in `ArtifactService` and have two scopes: session scope (a plain filename like `"report.pdf"`) and user scope (`"user:profile.png"`) accessible across all of a user's sessions.

Each `save_artifact` call auto-increments the version number, so you get versioned document history for free. `InMemoryArtifactService` for development; `GcsArtifactService` for production.

## Callbacks

Six lifecycle hooks, each with precise return value semantics. The table matters here because the behavior difference between returning `None` and returning a value is the difference between the hook observing and the hook intercepting:

| Callback | Trigger | Return `None` | Return value |
|---|---|---|---|
| `before_agent_callback` | Before agent runs | Agent proceeds | Skips agent, uses returned Content |
| `after_agent_callback` | After agent completes | Original output kept | Replaces output |
| `before_model_callback` | Before LLM API call | LLM call proceeds | Skips LLM, uses returned LlmResponse |
| `after_model_callback` | After LLM response | Original response kept | Replaces response |
| `before_tool_callback` | Before tool executes | Tool runs normally | Skips tool, uses returned dict |
| `after_tool_callback` | After tool returns | Original result kept | Replaces result |

The four context objects give hooks different access levels in order of expanding capability: `ReadonlyContext` → `CallbackContext` → `ToolContext` → `InvocationContext`. Custom agents implementing `_run_async_impl()` directly get `InvocationContext`, the most comprehensive one.

`before_model_callback` is the right place to inject guardrail checks before spending tokens on an LLM call. `after_tool_callback` is where you'd audit or log tool invocations without modifying results. The return-value-as-interceptor pattern makes it clean to write short-circuit logic without needing to modify agent code.

## Multi-agent orchestration

ADK supports three orchestration paradigms, freely combinable:

**LLM-driven dynamic routing**: An `LlmAgent` with a `sub_agents` list uses the model's reasoning to decide which child to delegate to. It issues `transfer_to_agent` signals via `EventActions`. The intelligence is in the LLM; the framework just routes the signals.

**Workflow-based deterministic**: `SequentialAgent`, `ParallelAgent`, `LoopAgent` for predictable control flow. Data flows through `session.state`, with `output_key` on child `LlmAgent`s writing results to named slots that the next step reads.

**Hybrid**: The canonical pattern combines all three. Parallel research agents feed into a synthesizing LlmAgent, which feeds into an iterative refinement loop — all wrapped in a `SequentialAgent` at the top level. The workflow agents provide the skeleton; the LLM agents provide the reasoning at each node.

## The plugin and safety system

ADK's plugin system applies cross-agent safety policies at the `Runner` level rather than inside individual agents. A policy defined once in a plugin applies uniformly across everything in that runner.

The built-in **Gemini as a Judge Plugin** uses Gemini Flash Lite to evaluate inputs and outputs at every critical point: content safety, prompt injection detection, jailbreak attempts, brand safety. It's a probabilistic classifier running as a callback, essentially — but managed as a runner-level concern rather than scattered through individual agents.

Human-in-the-loop approval gates use `tool_context.request_confirmation()` inside a tool function. The agent pauses, transitions to an `input-required` state, and waits for external confirmation before proceeding. This is the right integration point for high-stakes actions — wire transfer approvals, irreversible operations.

> [!WARNING]
> App-scoped state (`app:` prefix) provides a useful but limited security boundary. An agent can read `app:` keys it has access to; it can't write them from a session context. But it can still pass their values as inputs to tools or sub-agents. Defense-in-depth still matters — `app:` prefix protects against session-level manipulation, not against an agent that reads the value and does something unexpected with it.

## What the A2A protocol is

A2A is an open protocol for communication between AI agent systems that don't share a codebase, a framework, or an operator.[^2] It was announced at Google Cloud Next in April 2025, reached v1.0 in early 2026, and is now governed by the Linux Foundation with 150+ supporting organizations — AWS, Microsoft, Salesforce, SAP, Adobe, and most of the major SIs.

Five design principles drive the spec: embrace agentic capabilities (agents collaborate without needing to share memory or execution plans); build on open standards (HTTP, JSON-RPC 2.0, SSE — nothing proprietary); secure by default; support long-running tasks with lifecycle management; and remain modality-agnostic (text, audio, video, structured data all treated uniformly as `Part` objects).

The protocol has three layers: a data model (Task, Message, AgentCard, Part, Artifact), a set of operations (send message, stream, get/list/cancel tasks, push notification management), and protocol bindings (JSON-RPC 2.0, gRPC, HTTP/REST).

## Agent Cards and discovery

Every A2A agent publishes an **Agent Card** — a JSON document at `/.well-known/agent-card.json` — declaring its name, endpoint URL, capabilities (streaming support, push notifications), authentication requirements, the skills it can perform, and supported input/output modalities.

This is how agents discover each other without human-mediated integration. A client agent reads a remote agent's card, confirms it can handle the task, understands how to authenticate, and then initiates a task — all programmatically. Agent Cards can be cryptographically signed via JWS (RFC 7515) so clients can verify they haven't been tampered with.

## The Task lifecycle

A2A's unit of work is the **Task**. Each task has a unique ID, a `contextId` for grouping related interactions (useful for multi-turn exchanges), a `status` (the `TaskState`), an optional history of messages, and optional artifacts.

The state machine: `submitted` → `working` → `completed` (happy path). Alternate paths: `input-required` (agent needs clarification before proceeding), `auth-required` (secondary credentials needed mid-execution), `canceled`, `failed`, `rejected`.

The `input-required` state is one of the more thoughtful design choices in the protocol. It handles interactive, multi-turn tasks without hacking around the request/response model — the task pauses legitimately, the client responds with additional input, and the task resumes within the same context.

**Messages** within a task carry a `role` ("user" or "agent"), a unique `messageId`, and a list of `Part` objects. In v1.0 each `Part` uses a `oneof` structure: `text` (string), `raw` (base64 binary), `url` (URI reference), or `data` (structured JSON). Parts can also carry `mediaType`, `filename`, and `metadata`.

## Three communication modes

| Mode | Mechanism | When to use |
|---|---|---|
| Request/response | `message/send` via JSON-RPC | Short tasks with near-immediate results |
| Streaming | `message/stream` via SSE | Long outputs, real-time status updates |
| Push notifications | Webhook registration via `tasks/pushNotificationConfig/create` | Hours-long tasks, disconnected clients |

Streaming over SSE delivers two event types: `TaskStatusUpdateEvent` (state transitions) and `TaskArtifactUpdateEvent` (incremental content). The stream closes when the task reaches a terminal state. Push notifications flip the model — the server HTTP POSTs to a client-supplied webhook URL as task state changes, so the client doesn't need to maintain a connection or poll.

## ADK meets A2A

ADK includes first-class A2A integration via `pip install google-adk[a2a]`.

Exposing a local agent as an A2A service takes about four lines:

```python
from google.adk.a2a import to_a2a

app = to_a2a(my_agent)  # Returns an ASGI app
# Serves /.well-known/agent-card.json and the JSON-RPC endpoint
```

Internally, `to_a2a()` creates a `Runner` with in-memory services, an `A2aAgentExecutor` that bridges the A2A protocol to the ADK runtime, a `DefaultRequestHandler` for JSON-RPC routing, and an `AgentCardBuilder` that auto-generates the card from the agent's metadata.

Consuming a remote A2A agent works through `RemoteA2aAgent`:

```python
from google.adk.a2a import RemoteA2aAgent

remote_agent = RemoteA2aAgent(
    name="risk_scorer",
    agent_card_url="https://risk-service.internal/.well-known/agent-card.json"
)

orchestrator = LlmAgent(
    model="gemini-2.0-flash",
    sub_agents=[local_agent, remote_agent]  # remote treated identically to local
)
```

`RemoteA2aAgent` resolves the card, manages HTTP connections, and converts between A2A messages and ADK events. From the orchestrator's perspective, there's no difference between a local sub-agent and a remote one. That's the abstraction the integration is going for.

## A2A security

A2A treats agents as standard enterprise applications and handles security at the HTTP transport layer. The flow: client reads authentication and `securitySchemes` from the Agent Card during discovery, obtains credentials out-of-band, transmits via `Authorization: Bearer <token>`, and the server validates every request — 401 or 403 on failure.

Supported schemes in v1.0: API key, HTTP bearer/basic, OAuth 2.0 (authorization code, client credentials, device code flows), OpenID Connect, and mutual TLS. The approach is deliberately conservative — reuse existing enterprise identity infrastructure rather than inventing a new auth model.

The `auth-required` task state handles the case where secondary credentials are needed mid-execution, which is common in financial workflows where step-up authentication gates specific operations.

## A2A vs. MCP

The framing I find most useful:

| Dimension | A2A | MCP |
|---|---|---|
| Purpose | Agent-to-agent communication | Agent-to-tool/resource access |
| Relationship | Peer collaboration | Tool invocation |
| Unit of work | Task (stateful lifecycle) | Tool call (structured I/O) |
| State | Built-in task states | No explicit task state |
| Discovery | Agent Cards at well-known URIs | Tool descriptions in server manifest |
| Governance | Linux Foundation | Anthropic |

MCP handles vertical integration — an agent connecting to databases, APIs, file systems, search indices. A2A handles horizontal integration — agents connecting to other agents as peers. A `LoanProcessor` agent uses MCP to call a credit-check API and pull from a document store, then uses A2A to delegate fund disbursement to a `DisbursementAgent` operated by a different team. The protocols compose rather than compete.

## The question I keep coming back to

The ADK/A2A stack is the most coherent framework-plus-protocol proposal I've seen for the multi-agent problem. The cooperative event loop is genuinely clever. The prefix-scoped state model is a better answer to the "how do agents share data without stomping on each other" problem than most alternatives I've encountered. The A2A task lifecycle covers the real use cases including the awkward middle states (`input-required`, `auth-required`) that most REST APIs pretend don't exist.

What I'm less sure about is the trust model between agents at the application layer. A2A tells you who you're talking to and authenticates the connection. It doesn't tell you whether the remote agent will behave reliably under adversarial inputs, whether it'll honor the semantics its Agent Card claims, or what happens when a chain of delegated tasks fails halfway through with no circuit breaker. Those are properties the spec is silent on, and they're the properties that determine whether a multi-agent system is safe to run inside a regulated institution.

The `to_a2a()` and `RemoteA2aAgent` bridge is elegant enough that it makes the interoperability problem feel nearly solved. I suspect the hard part is still ahead.

---

[^1]: ADK's Python GitHub repo: [github.com/google/adk-python](https://github.com/google/adk-python). The framework launched at Google Cloud NEXT on April 9, 2025, alongside the A2A protocol announcement. TypeScript and Go SDKs followed. The `pip install google-adk` package installs the core framework; `pip install google-adk[a2a]` adds the A2A integration layer (currently experimental).
[^2]: The A2A spec lives at [a2a-protocol.org](https://a2a-protocol.org/latest/specification/) and is maintained at [github.com/a2aproject/A2A](https://github.com/a2aproject/A2A). V1.0 was reached in early 2026. The Linux Foundation governance move is what signaled the protocol crossing from Google-led proposal to genuine open standard — the same path MCP traveled, though MCP remains Anthropic-governed.
[^3]: The state prefix scoping system is one of the more underappreciated design choices in ADK. The practical implication for financial applications: use `app:` prefix for policy parameters that should be set at configuration time and read-only at runtime. Use `user:` prefix for KYC status, preferences, risk tier — anything that should persist across sessions for the same user but be isolated between users. Use session-scoped state for the working scratchpad within a single workflow run.
[^4]: The `before_model_callback` interception pattern is the most efficient place to implement guardrail checks — you avoid the token cost of an LLM call entirely if the input fails a safety check. The callback receives an `LlmRequest` with the full prompt including tool definitions. Returning a hardcoded `LlmResponse` short-circuits the API call completely.
[^5]: A2A push notification delivery uses standard HTTP POST to a client-supplied webhook URL. The spec requires the server to include a task ID and the new state in the POST body. There's no built-in retry guarantee in the spec itself — reliable delivery depends on the webhook infrastructure the client operates. Worth thinking about carefully for anything mission-critical.
