# Agent Note: Gate no-op sandbox escalation at the tool boundary

Status: implemented

English | [中文](2026-08-24-escalation-schema-gating.zh.md)

## Problem

The `pwsh`, `write`, and `edit` schemas advertised sandbox escalation whenever their executor reported confinement. That capability fact did not mean the standing mode had a wider target or that approval was enabled. Models therefore generated `sandbox_permissions` or `justification` under `danger-full-access` and `approval=never`; pairing and strict-widening validation rejected otherwise valid work before execution.

## Decision

The tool plugins derive their advertised escalation fields from the composed sandbox-policy default and approval-service default. Both fields appear together only when approval is `ask` and the standing mode has a strictly wider target. Their enum contains only those wider targets. No approval service, `approval=never`, and `danger-full-access` expose neither field.

Execution remains per-session and authoritative. Confined calls preserve paired-argument validation, strict widening, and the existing approval flow. A call whose resolved session mode is already `danger-full-access` ignores stale escalation metadata and executes under its unchanged standing policy. Filesystem denial results include the retry hint only when the plugin advertises a usable escalation path.

The existing delegated-child policy remains unchanged: children are pinned to `approval=never` and receive the established runtime-context instruction that their scope cannot widen and denied operations must not be retried.

## Alternatives considered

**Change the subprocess service.** Rejected because process launch receives an already validated sandbox policy and does not own model-facing tool arguments.

**Teach the provider or security-research coordinator to retry.** Rejected because the defect occurs before those layers and a retry would repeat the same invalid call.

**Ignore escalation fields in every mode.** Rejected because lower modes must fail closed and route real widening requests through approval.

## Consequences

Full-access commands and mutations are no longer lost to meaningless escalation metadata. Lower-permission security is unchanged. Static schemas reflect deployment defaults; session overrides are still enforced at execution, and delegated children rely on their existing `approval=never` context rather than a new orchestration mechanism.

## Testing

Focused `tool-pwsh` and `tool-fs` tests cover schema omission under missing/never approval, schema presence with a wider mode and `ask`, full-access tolerance for either stale field, malformed pairing at lower privilege, non-widening rejection, and approved strict widening. The continuable-child inheritance test pins the existing no-widen/no-retry prompt contract.
