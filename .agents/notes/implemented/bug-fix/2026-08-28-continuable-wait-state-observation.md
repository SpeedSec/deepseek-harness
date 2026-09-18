# Agent Note: Continuable waits observe pending state changes

Status: implemented

English | [中文](2026-08-28-continuable-wait-state-observation.zh.md)

## Problem

`waitContinuable()` can observe an Activation whose Agent is idle while accepted inbox work or an owned child keeps the Activation resident. `Agent.whenIdle()` is already resolved in that state.

Racing that resolved promise against the Activation's pending `poke` promise in an unconditional loop repeatedly attaches losing reactions to the same retained promise. The loop can exhaust the JavaScript heap before the timeout or settlement watcher runs.

## Decision

The `ContinuationActivationRegistry` owns status and waiting alongside its residency graph; the continuation manager only forwards observations. The wait follows the same state distinction as Activation settlement. A running Agent waits for either `whenIdle()` or `poke`; an idle resident Activation waits only for `poke`; the Inbox's open disposal transaction is awaited directly. Each loop iteration therefore blocks on a state change that has not happened.

Timeout and caller cancellation stop only the observation. They do not cancel the child, alter inbox work, or open disposal.

## Verification

The continuable ownership test holds a parent Agent idle while its gated child keeps the parent Activation in `waiting`. A spy verifies that a bounded wait times out without calling the already-resolved `whenIdle()`. Existing coverage verifies running-state timeout, eventual settlement, and handle removal.

## Alternatives considered

**Poll the status with a delay.** Polling adds a second scheduler, increases latency, and still duplicates the state transitions already published through `poke` and `whenIdle()`.

**Add a second completion controller to every Activation.** The Activation already owns the signals required to observe running work, ownership release, and disposal. Another controller would duplicate lifecycle state and require additional cleanup paths.

**Remove the public wait operation.** Current consumers need bounded observation of a continuable child. Removing the operation would avoid this implementation defect by deleting required behavior rather than correcting its shared owner.

## Consequences

- A stale resident state can time out, but it cannot turn an already-idle Agent into an allocation loop.
- The wait retains no polling interval or new lifecycle state.
- Settlement, interruption, timeout, and caller cancellation keep their existing owners.
