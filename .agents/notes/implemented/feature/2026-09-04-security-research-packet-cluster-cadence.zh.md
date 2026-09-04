# Agent Note: Security-research packet truncation and cluster cadence

Status: implemented

[English](2026-09-04-security-research-packet-cluster-cadence.md) | 中文

## Problem

大型多目标安全研究 Goal 会把 Coordinator ResearchPacket 填满，字节截断把账本 record 砍到 1 条并清空 relation。Planner 随后只看见完整的 `assetCoverage` 计数地图，没有 record 正文和边，把 omittedRecords 当成未探索工作，并用并行搜索占满独立槽，而不是加深当前活簇或拼接开放 gap。

## Decision

`buildResearchPacket` 投影精简的导航用 record 与 relation。字节截断先丢掉 record-id 索引，再丢掉 coverage 行，再减少 record 条数，并在最后的元数据兜底之前保留 8 条 record 下限。交付的 security-research preset 将 `packetMaxBytes` 设为 65536。截断不是完成声明：`omittedRecords` 统计的是被丢掉的 Packet 字段。Packet 被截断时，CoordinatorAction 会带上非绑定的 `packetTruncated` 提示。

Planner 政策把一个已分类的产品面当作一个搜索单元，而不是整家公司。测绘/搜资产的 explorer 页只覆盖当前簇；该簇仍有 probed 活面且没有 inDepth 结果或 Host 绑定 limitation 时，另一条同侧搜索不得占用独立槽。同侧搜索是同一簇上的第二条测绘/搜资产 explorer 页，不是第二个 experimenter、challenger 或 synthesizer，也不是另一张已登记产品面的第一页测绘；这些 Worker 在拥有不同 `primary_record_id` 时可与一条 running 线重叠。`maxIndependentChildren` 仍是重叠容量，不是搜索路数配额，也不是每个槽的固定岗位。Explorer 聚类是每类两到三个活 host，然后在写长产物之前报告。能完成的登录仍在范围内；limitation 关掉的是卡死的表单页，不是整条认证研究线。遇到 ran out of room 或反复 stop 后，Coordinator 放弃该线并派一个更小的新页。open bridge 或 gap 增长时，优先一次拼链派工而不是新的同侧搜索。src-hunt 仍是可选弹药；explorer 聚类页默认不加载。running 线的 CoordinatorAction next 以及 wait 与 overlap 的口径见[独立重叠笔记](2026-09-04-security-research-independent-overlap-next.zh.md)。产品面锁定与公司锁定见[产品面锁定笔记](2026-09-05-security-research-product-face-lock.zh.md)。

## Alternatives considered

**只提高 `packetMaxBytes`、不改截断顺序。** 否决：肥账本在 coverage JSON 占满预算后仍会把 record 砍到 1 条。

**新增 coverage 服务、种子队列存储或第二套研究数据库。** 否决：Coordinator Session Log 已经拥有持久化 batch；第二存储会重复账本。

**只要有 breadth 线在跑，Host 就拒绝第二条搜索 explorer。** 延期：先交付政策和 Packet 可见性；Host 准入仍只用现有最后一槽 starvation guard，直到后续真跑证明政策不够。

**每个 explorer 聚类页都加载 src-hunt。** 否决：普通资产测绘不是专项活体信号。

## Consequences

大型多目标 Goal 的 Planner 在交付的 64KiB Packet 预算下仍能看到精简的 record 与 relation 导航。截断不再意味着被省略的目标尚未探索。搜索节奏和 src-hunt 加载仍是政策，不是新调度器。独立验证、证据句柄和最后一槽 starvation guard 不变。
