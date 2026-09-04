# Agent Note: Security-research locks a classified product face, not the company

Status: implemented

[English](2026-09-05-security-research-product-face-lock.md) | 中文

## Problem

`PLANNER_POLICY` 把 Goal 点名的面写成一个锁定簇，并让旁系品牌在该簇加深前保持 discovered pending。Coordinator 随后把整家公司串行化：已经写入多个独立 scope 资产后，仍在等那一页 explorer。同侧搜索、open-bridge 优先、登录墙 limitation 缺少簇主语，被读成全公司流水线。同等效力的事故补丁 `join(' ')` 成一份政策，最短操作口号压过开放世界发现。目标仍是真实中高危危害；未知、长链和组合路径用来发现检查表会漏掉的问题，不得压过已有鉴别器的活路径。

## Decision

`PLANNER_POLICY` 仍通过 `security-research:policy` 打进每一次 Planner 请求。锁定面是一个已分类的产品面，不是整家公司。共享身份、信任或实现的 Goal 主域收成一类，一类一面，一面一页测绘。Goal 已点名且账本已写成不同资产的主域是不同锁定面；各自可开第一页 explorer 测绘，不必等另一面达到 inDepth。同侧搜索是同一簇上的第二页测绘，不是另一张已登记产品面的第一页测绘。测绘中才发现的 CDN、通用云和尚未分类的品牌保持 discovered pending；已经登记的独立 scope 资产不是旁系品牌。

能完成的登录，包括 Goal 提供的 OTP 或手机号，是加深手段。limitation 只在该表单已经失败、再打也不会过后关掉这一页卡死表单，而不是整条认证研究线。未认证业务 API 补充过不去的墙，不替代登录后研究。

深度和广度叠在不同锁定面上。未知、长链和组合机制不得压过已有鉴别器的活路径。想先打穿一个品牌再碰另一张已登记产品面，不是 grounding 依赖。open-bridge 增长时优先拼链派工而不是新的同侧搜索；另一张已登记、仍 untouched 的产品面仍可开第一页测绘。Host `CoordinatorAction.next` 仍是 `independent_dispatch_if_different_primary_else_wait`。

同一常量保持三层顺序：研究论点、锁定面派工、然后 Host 控制面规则。控制面正文写明它约束工具与生命周期，不规定发现顺序。后续补丁按此分流：生命周期事故只改控制面句子；节奏误读只改锁定面句子并保留簇主语；改写旧句，不追加同等效力的否定句。该维护分流写在本笔记中，不写进政策正文。

Packet 截断与一簇一搜索单元仍见[簇节奏笔记](2026-09-04-security-research-packet-cluster-cadence.zh.md)。running 线的重叠与 wait 仍见[独立重叠笔记](2026-09-04-security-research-independent-overlap-next.zh.md)。

## Alternatives considered

**把 `maxIndependentChildren` 设为 1，或强制开 N 个 explorer。** 否决：重叠容量不是搜索配额，强制 N 会变成测绘轰炸。

**只要有 Child 在跑，Host 就拒绝第二条 explorer。** 否决：那会把独立产品面串行化；准入仍只用最后一槽 starvation guard。

**新增 coverage 服务、种子队列或每域名槽位表。** 否决：Coordinator Session Log 已经拥有持久化 batch。

**把论点与 Host 操作拆成额外 systemPrompt section 或政策编译器。** 否决：那是第二条注入路径；一个 `PLANNER_POLICY` 常量足够。

**让未知、长链和组合工作压过活路径上的加深。** 否决：Goal 是真实中高危危害，不是为未知而未知。

**把每道登录墙都当成结束认证研究的 limitation。** 否决：能完成的登录，包括已提供的 OTP，正是登录后对象与鉴权问题所在。

## Consequences

大型多目标 Goal 可以对每个已分类产品面保留一页第一测绘，通常同时两到三个面，而不引入第二存储或调度器。同一簇在 probed 活面尚未 inDepth 或没有 Host 绑定 limitation 时，仍禁止第二页测绘。能完成的登录仍在范围内。生命周期事故可以只补控制面句子，而不改写发现顺序。
