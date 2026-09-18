# Agent Note: Explicit historical extension ownership and closed Session preparation

Status: proposed

English | [中文](2026-09-18-explicit-historical-extension-owners.zh.md)

## Problem

Historical research events contain references to other Sessions. First-party migrations consume Assistant chunks and insert system events, so copying extension payloads preserves incorrect coordinates. Admitting an event in the Host alone also leaves an isolated publication verifier without its owning schema.

## Proposal

An explicit deployment policy owns historical extension admission, payload reference rewriting, and final verification. Each adjacent core stage reports surviving source and target coordinates. The extension cannot change core event envelopes or override first-party validators. Default catalog calls retain [unknown-event refusal](../../implemented/architecture/2026-08-31-alpha-historical-unknown-event-refusal.md); mounted plugins and Session contents cannot select the policy. This supplements that decision for explicit offline callers; its default refusal rationale and the [streaming generation owner](../../implemented/architecture/2026-08-31-released-session-format-migrations.md) remain active.

The JSONL owner loads a local module pinned by SHA256 and a policy fingerprint in both Host and verifier workers. The research owner prepares the complete Session reference set twice: first to collect core coordinate maps, then to rewrite research references and verify target call/result identity. Original generations remain unchanged. Publication reuses existing exclusive generation writes and records progress in an exclusively created, synced journal. Multiple directories are not one filesystem transaction; an incomplete candidate home stays quarantined until a complete validated retry.

## Alternatives considered

**Copy ignorable extensions unchanged** loses reference identity after sequence changes. **Drop extensions** loses research evidence and unfinished obligations. **Rewrite every number** corrupts ordinary counters, status codes, and model text. **Load a policy named by the artifact** turns untrusted history into executable deployment configuration. **Change the current generation filename or source header** bypasses validation and destroys the existing recovery guarantee.

## Acceptance criteria

Default first-party and unknown-event behavior must remain unchanged. Owned v0/v1/v2 events must preserve cross-Session call/result identity, including equal numeric positions in different Sessions and consumed-chunk rejection. Explicit batches and repeated legacy metadata must remain equivalent. Host and actual worker must enforce the same pinned policy. Cancellation, source changes, verification failure, missing Sessions, and competing publication must retain original bytes and never activate an incomplete candidate home.

The research owner appends one ignorable provenance event when historical scope identities or completion audits require original coordinates. Projection uses original scope identities and audit hash inputs, while exact reads use current coordinates. Ambiguous scope selectors require an explicit source version; historical model text remains unchanged. Focused tests compare stable scope IDs, audit ledger hashes, and page snapshot IDs. Full reopen, one controlled continuation, second reopen, rollback, built-worker, and installed-package checks remain required before this proposal can be marked implemented.

## Risks

Research schema ownership must cover nested fields, not only event tags. An owner version cannot silently accept future fields. A partial directory set can contain individually complete generations while still lacking usable cross-Session closure. Policy source hashes and fingerprints do not replace artifact dependency manifests. Prepared artifacts and coordinate maps retain memory proportional to the selected closed set.
