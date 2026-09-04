# Agent Note: Security-research independent overlap is not a second search

Status: implemented

English | [中文](2026-09-04-security-research-independent-overlap-next.zh.md)

## Problem

Planner policy already treats one asset cluster as one search unit so a second explorer asset-mapping or search page does not occupy an independent slot while that cluster still has probed live faces. Coordinators still serialize every Child, including experimenter, challenger, and synthesizer work on a different `primary_record_id`, because `same-side search` is read as any `research_dispatch`, reconcile-before-shell is read as wait, and `CoordinatorAction.next` while every active line is running names wait before independent dispatch.

## Decision

`PLANNER_POLICY` defines same-side search as a second explorer asset-mapping or search page on that cluster, not a second experimenter, challenger, or synthesizer, and not the first mapping page of another registered product face. Those Workers overlap a running line when they own a different `primary_record_id`. `maxIndependentChildren` remains overlap capacity, not a search-path quota or a fixed job for each slot. Wait applies only when the next dispatch needs grounding that is not yet Host-admitted; a different `primary_record_id` on the same cluster is not that dependency, and finishing one brand before touching another registered face is not that dependency. Reconciling active-line status does not require wait when a different primary is executable. What counts as one cluster is a classified product face, not the whole company; see [the product-face lock note](2026-09-05-security-research-product-face-lock.md).

While every active line is running, `CoordinatorAction.next` is `independent_dispatch_if_different_primary_else_wait`. A non-running active line still yields `resume_existing_child`. Host admission, last-slot starvation, evidence handles, and independent verification stay unchanged. Packet truncation and cluster search units stay in [the packet-cluster cadence note](2026-09-04-security-research-packet-cluster-cadence.md).

## Alternatives considered

**Set `maxIndependentChildren` to 1.** Rejected because that serializes deepening as well as search and contradicts overlap capacity.

**Host-reject a second explorer while any Child is active.** Deferred with the cadence note: policy and the CoordinatorAction next token ship first; admission stays the existing last-slot starvation guard.

**Keep `status_wait_interrupt_or_independent_dispatch` and add a negative policy sentence.** Rejected because a running-line next token that names wait first still dominates the negative sentence.

**Assign each independent slot a fixed profile.** Rejected because profiles are a choice map, not a sequence or quota.

## Consequences

Coordinators keep one search page per cluster and may overlap distinct-primary deepening, challenge, or synthesis without a second store, scheduler, or slot roster. Serial wait remains correct for a first explorer page whose later dispatch needs its Host-admitted records. Independent verification, evidence handles, and last-slot starvation are unchanged.
