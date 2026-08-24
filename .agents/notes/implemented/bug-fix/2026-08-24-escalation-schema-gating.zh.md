# Agent Note：在工具边界阻止无意义的沙箱升级

Status: implemented

[English](2026-08-24-escalation-schema-gating.md) | 中文

## 问题

过去，只要执行器报告存在沙箱限制，`pwsh`、`write` 和 `edit` 的 schema 就会公开沙箱升级字段。这个能力事实并不代表常驻模式仍有更高权限，也不代表审批已启用。因此，模型会在 `danger-full-access` 或 `approval=never` 下生成 `sandbox_permissions` 或 `justification`，参数配对或严格升权校验会在执行前拒绝原本有效的任务。

## 决策

工具插件根据已装配 sandbox-policy 的默认模式和 approval-service 的默认策略决定是否公开升级字段。只有审批为 `ask` 且常驻模式存在严格更高的目标时，两个字段才会同时出现，枚举也只包含这些更高目标。没有审批服务、`approval=never` 和 `danger-full-access` 均不公开两个字段。

执行阶段仍以每个 session 的实际状态为最终依据。受限调用继续执行参数成对校验、严格升权和既有审批流程。若该次调用解析出的 session 模式已经是 `danger-full-access`，工具会忽略残留的升级元数据，并按未改变的常驻策略执行。文件系统拒绝结果仅在插件确实公开可用升级路径时附带重试提示。

既有子代理委派策略保持不变：Child 固定为 `approval=never`，并继续收到原有运行时上下文，明确权限范围不可扩大且被拒操作不得重试。

## 备选方案

**修改 subprocess 服务。** 不采用，因为进程启动层收到的是已经校验完成的沙箱策略，不拥有面向模型的工具参数。

**让 provider 或安全研究协调器重试。** 不采用，因为缺陷发生在这些层之前，重试只会重复同一个无效调用。

**在所有模式下都忽略升级字段。** 不采用，因为低权限模式必须 fail-closed，并把真实升权请求交给审批流程。

## 影响

最高权限命令和文件修改不再因无意义升级元数据而丢失。低权限安全边界不变。静态 schema 反映部署默认值；session 覆盖仍在执行阶段强制校验，委派 Child 继续依赖既有 `approval=never` 上下文，无需新增编排机制。

## 测试

`tool-pwsh` 和 `tool-fs` 的 focused tests 覆盖缺少审批或 `never` 时隐藏 schema、存在更高模式且为 `ask` 时公开 schema、最高权限容忍任一残留字段、低权限字段缺失配对、非升权请求拒绝，以及严格更高权限获批。continuable-child 继承测试固定既有的禁止升权和禁止重试提示约定。
