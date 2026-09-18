# Agent Note: 可忽略的插件生命周期事件

Status: implemented

[English](2026-08-25-plugin-lifecycle-events.md) | 中文

## 问题

仓库外研究插件只有在工具结果出现后才能持久化 Child 生命周期事实。Child 中断时没有可恢复的 started 标记，恢复投影只能依赖后续 envelope。

## 决策

`Session.appendPluginEvent(type, data)` 是仓库外插件写入生命周期事实的受支持路径。该方法会快照并冻结 JSON payload，以 `ignorable: true` 追加仅写日志事件，通过 `session/event` 发布，并复用现有持久化写入路径。核心事件名称会被拒绝，插件不能覆盖核心语义。

插件生命周期事件不会进入派生的模型历史。同格式下不认识该事件类型的读取方可以安全跳过；遇到未标记的未知事件时，读取方仍会拒绝恢复会话。结构格式迁移仍要求明确的所有者负责插件 payload 校验和事件序号引用。追加标记本身不能授予历史迁移支持。追加通过 Session 的提交路径共享核心 payload 校验、观察器异常隔离与重入拒绝。

## 后果

插件可以在前台操作结算前持久化启动事实，并用同一个插件自有 identity 追加后续结算事实。持久化后端无需改变格式，因为事件 envelope 已经支持 `ignorable`。

## 备选方案

拒绝伪造 `tool/result`、复用无关核心事件类型、增加插件注册表，以及增加第二套存储或调度器。现有事件 envelope 和持久化 feed 已经足够。
