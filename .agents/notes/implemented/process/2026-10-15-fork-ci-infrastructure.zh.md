# Agent Note: Fork CI 基础设施

Status: implemented

English | [中文](2026-10-15-fork-ci-infrastructure.md)

## Problem

Fork 仓库不会继承上游组织的大型 runner、GitHub App 凭据、Cloudflare 部署凭据或自托管机器。否则，必需的产品任务会一直排队，而无关的组织自动化会在验证代码前失败。

## Decision

Fork 仓库的三个主要 Linux 任务使用 `ubuntu-24.04`，三个原生 Windows 任务使用 `windows-2025`。必需检查的名称、测试命令、聚合依赖和失败传播保持不变。非 fork 仓库保留现有[故障切换选择器](2026-07-26-ci-failover-runbook.zh.md)，包括对 Dependabot 的限制。

Fork 分别通过仓库变量 `DSH_UPSTREAM_PROJECT_AUTOMATION`、`DSH_CLOUDFLARE_PREVIEW`、`DSH_WEIGHTED_APPROVAL` 和 `DSH_SELF_HOSTED_STANDBY` 启用上游项目自动化、Cloudflare 预览、加权审批和自托管备用演练。每项都要求字面值 `true`，并要求提供对应工作流原本依赖的外部基础设施。非 fork 仓库保留自动执行和凭据缺失时明确失败的检查。

Fork 的已安装 wheel CI 保留全部无密钥场景。其四个依赖凭据的真实 API 测试步骤，除现有平台和事件条件外，还要求 fork 设置 `DSH_LIVE_API_VALIDATION=true`。显式启用后仍保留凭据预检失败；无密钥运行不会被当作模型请求已通过验证。

本决策为上游 CI 决策未配置的部署环境补充配置，不取代其 runner 隔离、平台划分、发布验证或信任规则。运行时源码、本地 profile、凭据、插件和持久化会话不属于此配置。

## Alternatives considered

**在 fork 上禁用产品 CI。** 这会丢失升级的构建、覆盖率、快照和原生进程验证证据。公共托管 runner 无需访问上游资源池即可保留这些证据。

**要求每个 fork 提供上游组织凭据。** 独立所有者无法配置其他组织的 GitHub App 或 runner。显式启用机制保留这些集成，但不让它们成为产品验证的前提。

**静默忽略真实 API 测试失败。** 这会混淆凭据缺失与验证成功。Fork 未启用时明确省略依赖凭据的步骤，而无密钥验证仍然必需。

## Consequences

公共 runner 可能更慢，也可能暴露资源敏感的测试失败；这些失败仍然按失败处理，不通过重试、弱化断言或删除测试掩盖。在 fork 上跳过的组织集成，不能证明部署、策略执行、真实 API 行为或备用机器可用。

[工作流回归测试](../../../../scripts/tests/ci-fork.spec.ts) 对提交中的选择器求值，覆盖 fork 与非 fork 环境、显式启用、两个原生操作系统以及保留的必需检查清单。现有工作流测试继续验证上游故障切换和可信策略检出。真实平台执行仍由 CI 负责。
