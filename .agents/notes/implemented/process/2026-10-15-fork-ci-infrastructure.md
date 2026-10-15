# Agent Note: Fork CI infrastructure

Status: implemented

English | [中文](2026-10-15-fork-ci-infrastructure.zh.md)

## Problem

Fork repositories do not inherit the upstream organization's larger runners, GitHub App credentials, Cloudflare deployment credentials, or self-hosted machines. Required product jobs otherwise remain queued, while unrelated organization automation fails before validating code.

## Decision

Fork repositories run the three primary Linux jobs on `ubuntu-24.04` and the three native Windows jobs on `windows-2025`. Required check names, test commands, aggregate dependencies, and failure propagation remain unchanged. Non-fork repositories retain the existing [failover selectors](2026-07-26-ci-failover-runbook.md), including their Dependabot restrictions.

Forks opt into upstream project automation, Cloudflare previews, weighted approval, and self-hosted standby drills separately through repository variables `DSH_UPSTREAM_PROJECT_AUTOMATION`, `DSH_CLOUDFLARE_PREVIEW`, `DSH_WEIGHTED_APPROVAL`, and `DSH_SELF_HOSTED_STANDBY`. Each requires the literal value `true` and the external infrastructure its workflow already expects. Non-fork repositories retain automatic execution and fail-loud credential checks.

Installed-wheel CI retains all keyless scenarios on forks. Its four credential-dependent live-test steps require `DSH_LIVE_API_VALIDATION=true` on a fork, in addition to their existing platform and event eligibility. Opting in retains credential preflight failures; no model request is presented as validated by a keyless run.

This supplements the upstream CI decisions for a deployment environment they do not provision; it does not replace their runner isolation, platform partitioning, release validation, or trust rules. Runtime sources, local profiles, credentials, plugins, and persisted sessions are outside this configuration.

## Alternatives considered

**Disable product CI on forks.** This removes the upgrade's build, coverage, snapshot, and native-process evidence. Public hosted runners keep that evidence without access to the upstream pools.

**Require upstream organization credentials on every fork.** Independent owners cannot provision another organization's GitHub App or runners. Explicit opt-ins keep these integrations available without making them prerequisites for product validation.

**Silently ignore failed live API tests.** This confuses missing credentials with successful validation. Forks explicitly omit credential-dependent steps unless enabled, while keyless validation remains required.

## Consequences

Public runners may be slower or expose resource-sensitive test failures; those failures remain failures rather than retries, weaker assertions, or removed tests. Organization integrations skipped on a fork are not evidence of successful deployment, policy enforcement, live API behavior, or standby availability.

The [workflow regression](../../../../scripts/tests/ci-fork.spec.ts) evaluates the committed selectors for fork and non-fork environments, explicit opt-ins, both native operating systems, and the retained required-check inventory. Existing workflow tests continue to verify upstream failover and trusted policy checkout. Real platform execution remains CI-owned.
