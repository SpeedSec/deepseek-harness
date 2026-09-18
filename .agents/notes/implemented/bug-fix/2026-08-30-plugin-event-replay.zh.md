# Agent Note: 回放插件生命周期事件且保持 fail-closed 读取

Status: implemented

[English](2026-08-30-plugin-event-replay.md) | 中文

## 问题

security-research 插件使用受支持的 `Session.appendPluginEvent()` 路径，在前台工具结果之前或之后持久化生命周期批次。写入方会发出带 `ignorable: true` 的未知事件，但持久化协调器和 SQLite 编解码器不再接受或保留该标记。因此新进程会拒绝一个实时写入方已经提交的有效研究会话。

## 决策

恢复既有插件事件约定。`SessionEvent` 只接受可选的 `ignorable: true` 标记，seed 校验保留该标记，协调器仅在标记存在时接受未知事件。未标记的未知事件继续 fail-closed。核心生成的事件词汇不加入插件名称，也不引入第二套研究存储。

JSONL 已经保留完整事件 envelope。SQLite schema 20 在独立的 `is_packed` 判别列旁保存 `ignorable`，标量行和打包行仍然明确可区分。按照预发布 SQLite 策略，schema 19 数据库与当前版本不兼容，不尝试迁移。

## 备选方案

**接受所有未知事件。** 这会绕过明确的 ignorable 标记并削弱 fail-closed 读取。保留标记可以维持插件约定，同时继续拒绝未标记事件。

## 后果

插件生命周期批次可以在冷启动后继续存在，并可由 security-research 投影读取。不理解且未标记的事件仍会拒绝重建，不会静默丢弃可能影响状态的事实。现有 schema-19 SQLite 文件需要匹配的旧版本或新数据库；JSONL 产物不会被改写。

## 测试

共享持久化协调器约定会在释放写入方后重新加载带标记的插件事件，同时继续拒绝未标记的未知事件。核心 session 测试覆盖标记 envelope。JSONL 与 SQLite 后端测试覆盖冷回放路径；SQLite 编解码测试覆盖标记保留和 schema 校验。
