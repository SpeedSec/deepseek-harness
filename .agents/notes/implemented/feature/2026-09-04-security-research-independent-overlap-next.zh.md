# Agent Note: Security-research independent overlap is not a second search

Status: implemented

[English](2026-09-04-security-research-independent-overlap-next.md) | 中文

## Problem

Planner 政策已经把一个资产簇当作一个搜索单元，以免在该簇仍有 probed 活面时让第二条测绘/搜资产的 explorer 页占用独立槽。Coordinator 仍会把每个 Child 串行化，包括对另一个 `primary_record_id` 的 experimenter、challenger 和 synthesizer 工作，因为 `same-side search` 被读成任意 `research_dispatch`，派工前对账被读成 wait，而且每条活动线都在 running 时 `CoordinatorAction.next` 把 wait 写在独立派工前面。

## Decision

`PLANNER_POLICY` 把同侧搜索定义为同一簇上的第二条测绘/搜资产 explorer 页，不是第二个 experimenter、challenger 或 synthesizer，也不是另一张已登记产品面的第一页测绘。这些 Worker 在拥有不同 `primary_record_id` 时可与一条 running 线重叠。`maxIndependentChildren` 仍是重叠容量，不是搜索路数配额，也不是每个槽的固定岗位。wait 只用于下一次派工需要尚未被 Host 承认的 grounding；同一簇上不同的 `primary_record_id` 不是这种依赖，先打穿一个品牌再碰另一张已登记产品面也不是这种依赖。当另一个 primary 可执行时，对账活动线状态不要求 wait。一个簇是已分类的产品面，不是整家公司；见[产品面锁定笔记](2026-09-05-security-research-product-face-lock.zh.md)。

当每条活动线都在 running 时，`CoordinatorAction.next` 为 `independent_dispatch_if_different_primary_else_wait`。存在非 running 的活动线时仍是 `resume_existing_child`。Host 准入、最后一槽 starvation、证据句柄和独立验证不变。Packet 截断与簇搜索单元见[簇节奏笔记](2026-09-04-security-research-packet-cluster-cadence.zh.md)。

## Alternatives considered

**把 `maxIndependentChildren` 设为 1。** 否决：那会把加深和搜索一起串行化，并与重叠容量矛盾。

**只要有 Child 在跑，Host 就拒绝第二条 explorer。** 与簇节奏笔记一并延期：先交付政策和 CoordinatorAction next token；准入仍只用现有最后一槽 starvation guard。

**保留 `status_wait_interrupt_or_independent_dispatch`，再加一句否定政策。** 否决：running 线的 next token 只要先写 wait，否定句仍压不过。

**给每个独立槽指定固定 Profile。** 否决：Profile 是选择图，不是顺序或配额。

## Consequences

Coordinator 对每个簇仍只保留一页搜索，并可以在不同 primary 上重叠加深、挑战或综合，而不引入第二存储、调度器或槽位岗位表。对第一页 explorer、且后续派工需要其 Host 已承认 record 的情况，串行 wait 仍然正确。独立验证、证据句柄和最后一槽 starvation 不变。
