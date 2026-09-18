# Agent Note: 可继续等待观察尚未发生的状态变化

Status: implemented

[English](2026-08-28-continuable-wait-state-observation.md) | 中文

## 问题

`waitContinuable()` 可能观察到一种 Activation：Agent 已空闲，但已接受的 inbox 工作或其拥有的 child 仍让 Activation 保持驻留。此时 `Agent.whenIdle()` 已经兑现。

如果无条件循环持续让这个已兑现 promise 与 Activation 尚未兑现的 `poke` promise 竞争，每轮都会把失败反应附加到同一个被保留的 promise 上。该循环可能在超时或结算观察器运行前耗尽 JavaScript 堆。

## 决策

`ContinuationActivationRegistry` 在拥有驻留图的同时负责状态与等待；continuation manager 只转发观察。等待采用与 Activation 结算相同的状态区分。运行中的 Agent 等待 `whenIdle()` 或 `poke`；空闲但仍驻留的 Activation 只等待 `poke`；Inbox 已经打开的 disposal 事务则被直接等待。因此每轮循环都会阻塞在尚未发生的状态变化上。

超时与调用方取消只会停止观察。它们不会取消 child、改变 inbox 工作或打开 disposal。

## 验证

可继续所有权测试让 parent Agent 保持空闲，同时由受控 child 把 parent Activation 保持在 `waiting`。spy 会验证一次有界等待在超时时没有调用已经兑现的 `whenIdle()`。既有覆盖验证运行状态超时、最终结算与句柄移除。

## 备选方案

**按延迟轮询状态。** 轮询会增加第二套调度器、提高延迟，并重复 `poke` 与 `whenIdle()` 已经发布的状态变化。

**为每个 Activation 增加第二个完成控制器。** Activation 已经拥有观察运行工作、所有权释放与 disposal 所需的信号。另一个控制器会重复生命周期状态，并要求额外清理路径。

**删除公开等待操作。** 当前消费者需要有界观察可继续 child。删除操作只是通过移除必要行为来绕开实现缺陷，而不是修正该行为的共享所有者。

## 后果

- 过期的驻留状态可能超时，但无法再把已经空闲的 Agent 变成分配循环。
- 等待不会保留轮询间隔或新增生命周期状态。
- 结算、中断、超时与调用方取消继续由各自既有所有者负责。
