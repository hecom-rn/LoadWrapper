# LoadWrapper

[![npm version](https://img.shields.io/npm/v/@hecom/wrapper-load.svg?style=flat)](https://www.npmjs.com/package/@hecom/wrapper-load)
[![Build Status](https://travis-ci.org/hecom-rn/LoadWrapper.svg?branch=master)](https://travis-ci.org/hecom-rn/LoadWrapper)

这是对于通用加载队列的封装高阶组件。

默认导出为一个用于封装的高阶组件，`(WrappedComponent, options) => React.PureComponent`，其中`WrappedComponent`是待封装的组件，`options`是配置参数对象，属性如下：

* `canBack`：是否可以回退到上一页，如果为导航栈第一页，则设置为`false`。
* `initFunc`：初始化方法，根据调用后的队列大小，来决定是否启动加载队列。`param`的格式如下：
  * `props`：导航内部的参数，是`navigation.state.params`。
  * `item`：当前正在处理的任务项。
  * `push`：在队列中增加一项任务，`key`是等待队列判重的键，`value`是任务队列的任务项。
  * `isWaiting`：判断键`key`是否正在等待队列中等待。
  * `finish`：结束当前任务，`status`表示任务是否成功，`isStop`表示是否停止加载进程。
* `processFunc`：处理任务的方法，`param`与`initFunc`的相同格式和含义。
* `componentFunc`：最后渲染`WrappedComponent`之前，对于`navigation.state.params`这个导航内部参数的处理，返回处理后的内部参数。
* `errorTitle`：错误页面的标题。
* `errorPageOptions`：参照`ErrorPage`的属性。
* `loadingViewStyle`：加载视图的样式。