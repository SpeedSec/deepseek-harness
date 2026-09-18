# Agent Note: Replay plugin lifecycle events without weakening fail-closed reads

Status: implemented

English | [中文](2026-08-30-plugin-event-replay.zh.md)

## Problem

The security-research plugin uses the supported `Session.appendPluginEvent()` path to persist lifecycle batches before or after a foreground tool result. The writer emits an unknown event with `ignorable: true`, but the persistence coordinator and the SQLite codec had stopped accepting or preserving that marker. A fresh process therefore refused a valid research session even though the live writer had committed it.

## Decision

Restore the existing plugin-event contract. `SessionEvent` accepts only `ignorable: true` as the optional marker, seed validation preserves it, and the coordinator accepts an unknown event only when the marker is present. Unknown unmarked events remain fail-closed. No plugin name is added to the generated core vocabulary and no second research store is introduced.

JSONL already preserves the complete event envelope. SQLite schema 20 stores `ignorable` beside the independent `is_packed` discriminator, so scalar and packed rows remain unambiguous. Schema 19 databases are intentionally incompatible under the pre-release SQLite policy; no migration is attempted.

## Alternatives considered

**Accept every unknown event.** This would bypass the explicit ignorable marker and weaken fail-closed reads. Keeping the marker preserves the plugin contract without changing unmarked-event refusal.

## Consequences

Plugin lifecycle batches survive a cold reload and remain available to the security-research projection. A reader that does not understand an unmarked event still refuses reconstruction instead of silently dropping potentially load-bearing state. Existing schema-19 SQLite files require the matching older build or a fresh database; JSONL artifacts are not rewritten.

## Testing

The shared persistence coordinator contract reloads an ignorable plugin event after disposing the writer, and still rejects an unknown unmarked event. Core session tests cover the marker envelope. JSONL and SQLite backend suites cover the cold replay path; SQLite codec tests cover marker preservation and schema validation.
