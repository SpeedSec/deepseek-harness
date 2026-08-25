# Agent Note: Ignorable plugin lifecycle events

Status: implemented

English | [中文](2026-08-25-plugin-lifecycle-events.zh.md)

## Decision

`Session.appendPluginEvent(type, data)` is the supported write path for out-of-tree plugin lifecycle facts. It snapshots and freezes a JSON payload, appends a log-only event with `ignorable: true`, publishes it through `session/event`, and reuses the existing persistence write path. Core event names are rejected so plugins cannot shadow core semantics.

Plugin lifecycle events do not enter derived model history. Readers that do not know the event type may skip it safely; readers that encounter an unmarked unknown event continue to refuse the session. This preserves the existing unknown-event safety rule without adding a plugin registry, second store, or compatibility layer.

## Consequences

Plugins can persist a start fact before a foreground operation settles and append a later settlement fact with the same plugin-owned identity. Persistence backends require no format change because the event envelope already carries `ignorable`.
