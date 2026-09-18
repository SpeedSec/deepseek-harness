# Agent Note: 显式历史扩展所有权与完整 Session 集合准备

Status: proposed

[English](2026-09-18-explicit-historical-extension-owners.md) | 中文

## 问题

历史研究事件含有指向其他 Session 的引用。第一方迁移消费 Assistant chunk 并插入 system 事件，因此原样复制扩展 payload 会保留错误坐标。仅在 Host 接纳事件，也会让隔离的发布 verifier 缺少该事件的所属 schema。

## 提案

显式部署策略拥有历史扩展接纳、payload 引用重写与最终校验。每条相邻核心迁移报告保留的源与目标坐标。扩展不能修改核心事件 envelope 或覆盖第一方 validator。默认 catalog 调用保留[未知事件拒绝](../../implemented/architecture/2026-08-31-alpha-historical-unknown-event-refusal.zh.md)；挂载插件与 Session 内容不能选择策略。本提案为显式离线调用方补充该决定；其默认拒绝理由和[流式 generation 所有者](../../implemented/architecture/2026-08-31-released-session-format-migrations.zh.md)仍然有效。

JSONL 所有者在 Host 与 verifier worker 中加载同一个由 SHA256 和策略指纹固定的本地模块。研究所有者准备完整 Session 引用集合两遍：先收集核心坐标映射，再重写研究引用并校验目标 call/result 身份。原 generation 保持不变。发布复用现有独占 generation 写入，并在独占新建、同步落盘的 journal 中记录进度。多个目录不是一个文件系统事务；未完成的候选 home 保持隔离，直到完整且验证通过的重试结束。

## 考虑过的替代方案

**原样复制 ignorable 扩展**会在序号变化后失去引用身份。**丢弃扩展**会丢失研究证据和未完成责任。**重写每个数字**会损坏普通计数、状态码与模型文本。**加载 artifact 指定的策略**会将不可信历史变成可执行部署配置。**修改当前 generation 文件名或源 header**会绕过校验并破坏既有恢复保证。

## 验收标准

默认第一方及未知事件行为必须保持不变。被拥有的 v0/v1/v2 事件必须保留跨 Session call/result 身份，包括不同 Session 中相同数字位置和已消费 chunk 引用拒绝。显式 batch 与重复 legacy metadata 必须保持等价。Host 与真实 worker 必须执行同一个固定策略。取消、源变化、校验失败、缺失 Session 和竞争发布必须保留原始字节，且不能激活未完成的候选 home。

历史 scope 身份或 completion audit 需要原坐标时，研究所有者追加一个 ignorable 来源事件。投影使用原始 scope 身份与审计 hash 输入，精确读取使用当前坐标。有歧义的 scope 选择器要求显式源版本；历史模型文本保持不变。定向测试比较稳定 scope ID、审计 ledger hash 与分页 snapshot ID。在本提案标记 implemented 前，仍须完成 reopen、受控继续一轮、再次 reopen、回退、构建后的 worker 与已安装制品检查。

## 风险

研究 schema 所有权必须覆盖嵌套字段，不能只有事件标签。一个 owner 版本不能静默接纳未来字段。部分目录集合可能含有各自完整的 generation，却仍缺少可用的跨 Session 闭包。策略源码 hash 与指纹不能替代制品依赖清单。准备后的 artifact 与坐标映射占用随所选完整集合大小增长的内存。
