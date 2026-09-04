# Agent Note: Security-research packet truncation and cluster cadence

Status: implemented

English | [中文](2026-09-04-security-research-packet-cluster-cadence.zh.md)

## Problem

Large multi-target security-research Goals fill the Coordinator ResearchPacket until byte truncation drops ledger records to one row and clears relations. The Planner then sees a complete `assetCoverage` count map with no record bodies or edges, treats omittedRecords as unexplored work, and fills independent slots with parallel search instead of deepening a live cluster or bridging open gaps.

## Decision

`buildResearchPacket` projects compact navigation records and relations. Byte truncation drops the record-id index, then coverage rows, then record count, and keeps a floor of eight records before a last-resort metadata dump. The shipped security-research preset sets `packetMaxBytes` to 65536. Truncation is not completeness: `omittedRecords` counts dropped packet fields. When the packet is truncated, CoordinatorAction carries a non-binding `packetTruncated` advisory.

Planner policy treats one classified product face as one search unit, not the whole company. An explorer asset-mapping or search page covers only the current cluster; while that cluster still has probed live faces without an inDepth result or Host-bound limitation, another same-side search must not occupy an independent slot. Same-side search is a second explorer asset-mapping or search page on that cluster, not a second experimenter, challenger, or synthesizer, and not the first mapping page of another registered product face; those Workers overlap a running line when they own a different `primary_record_id`. `maxIndependentChildren` remains overlap capacity, not a search-path quota or a fixed job for each slot. Explorer clustering is two or three live hosts per class, then report before a long artifact. Completable login stays in scope; a limitation closes a stuck form page, not the authentication line. After ran out of room or repeated stop, the Coordinator abandons and dispatches a smaller fresh page. Open bridge or gap growth prefers one chain-bridging dispatch over a new same-side search. src-hunt stays optional ammunition; explorer clustering pages do not load it by default. Running-line CoordinatorAction next and wait-versus-overlap wording live in [the independent-overlap note](2026-09-04-security-research-independent-overlap-next.md). Product-face lock versus company lock lives in [the product-face lock note](2026-09-05-security-research-product-face-lock.md).

## Alternatives considered

**Raise `packetMaxBytes` without changing truncation order.** Rejected because a fat ledger still collapses records to one row once coverage JSON fills the budget.

**Add a coverage service, seed-queue store, or second research database.** Rejected because the Coordinator Session Log already owns durable batches; a second store duplicates the ledger.

**Host-reject a second search explorer while any breadth line is active.** Deferred: policy and packet visibility ship first; Host admission stays the existing last-slot starvation guard until a later run proves policy is insufficient.

**Keep src-hunt on every explorer clustering page.** Rejected because ordinary asset mapping is not a specialized live-target signal.

## Consequences

Planners of large multi-target Goals keep compact record and relation navigation under the shipped 64KiB packet budget. Truncation no longer implies that omitted targets are unexplored. Search cadence and src-hunt loading remain policy, not a new scheduler. Independent verification, evidence handles, and the last-slot starvation guard are unchanged.
