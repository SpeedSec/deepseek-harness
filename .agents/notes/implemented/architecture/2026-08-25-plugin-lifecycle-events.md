# Agent Note: Ignorable plugin lifecycle events

Status: implemented

English | [中文](2026-08-25-plugin-lifecycle-events.zh.md)

## Problem

Out-of-tree research plugins could only persist a Child lifecycle fact after a tool result existed. An interrupted Child therefore had no durable started marker, and recovery projection depended on a later envelope.

## Decision

`Session.appendPluginEvent(type, data)` is the supported write path for out-of-tree plugin lifecycle facts. It snapshots and freezes a JSON payload, appends a log-only event with `ignorable: true`, publishes it through `session/event`, and reuses the existing persistence write path. Core event names are rejected so plugins cannot shadow core semantics.

Plugin lifecycle events do not enter derived model history. Same-format readers that do not know the event type may skip it safely; readers that encounter an unmarked unknown event continue to refuse the session. Structural format migrations still require an explicit owner for plugin payload validation and event-sequence references. The append marker alone cannot grant historical migration support. Appends share core payload validation, observer containment, and reentry rejection through the Session commit path.

## Consequences

Plugins can persist a start fact before a foreground operation settles and append a later settlement fact with the same plugin-owned identity. Persistence backends require no format change because the event envelope already carries `ignorable`.

## Alternatives considered

Rejected forged `tool/result` events, reuse of unrelated core event types, a plugin registry, and a second storage or scheduler. The existing event envelope and persistence feed are sufficient.
