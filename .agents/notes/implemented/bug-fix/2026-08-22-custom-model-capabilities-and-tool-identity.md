# Agent Note: Expose custom model capabilities and refuse empty tool identities

Status: implemented

English | [中文](2026-08-22-custom-model-capabilities-and-tool-identity.zh.md)

## Problem

The pi-ai settings schema could describe image input and per-model reasoning levels, but the Models page could edit only identity and capacity. A model added through the page therefore remained text-only and exposed no reasoning selector unless the operator hand-edited `settings.yaml`. Separately, `BlockAssembler` fabricated a call id and an empty tool name when a provider emitted an incomplete tool-call identity. Tool policy then diagnosed the empty name as if a real tool had been denied, hiding the provider-response defect behind a consumer-specific error.

## Decision

The existing model row disclosure edits `input` with an inherit, text-only, or text-and-images choice. It edits `reasoningEfforts` as inherit, disabled, or an explicit set of canonical pi-ai levels. New levels use their canonical wire spelling; an existing non-identity wire spelling survives unrelated edits. Advanced protocol aliases and `compat` stay in `settings.yaml` rather than adding a second schema editor.

`BlockAssembler` requires every retained tool call to carry a non-whitespace id and name. It raises `LlmError` with `MALFORMED_RESPONSE` instead of inventing either value. A max-token finish still drops tool calls before validation because they cannot be executed and may be incomplete by definition. `MALFORMED_RESPONSE` joins the default transient retry set because the failed attempt produced no executable assistant message.

## Alternatives considered

**Assume every custom model accepts images and reasoning.** Rejected because capability over-claims move a clear local refusal into a provider failure after the user message is durable, and reasoning protocols disagree about offered levels.

**Add a generic JSON editor for the entire model profile.** Rejected because the settings document already provides that escape hatch; duplicating its schema, validation, and help text would add more surface than the two missing common capabilities require.

**Keep fabricating tool ids and let tool policy reject empty names.** Rejected because the diagnostic names the wrong subsystem and can trigger coordinator behavior for a tool the model never identified.

## Verification

Component tests write image input and reasoning levels through the real settings mutation payload. The assembled Models-page snapshot records the controls in a hand-declared provider flow and verifies the resulting settings document. Assembler tests reject missing ids and empty names while preserving max-token tool-call dropping and replay alignment.

## Consequences

Operators can make a non-catalog multimodal or reasoning model truthful without leaving the UI, and the conversation selector derives its choices from the same existing adapter metadata. Custom wire aliases remain an advanced text-setting operation. Malformed tool calls now retry or fail as model-response errors before any research or tool guard sees an empty tool name.
