# LoadWrapper

[![npm version](https://img.shields.io/npm/v/@hecom/wrapper-load.svg?style=flat)](https://www.npmjs.com/package/@hecom/wrapper-load)

这是对于通用加载队列的封装高阶组件。

**接口**：

默认导出为一个用于封装的高阶组件，`(WrappedComponent, options) => React.PureComponent`，其中`WrappedComponent`是待封装的组件，`options`是配置参数对象，属性如下：

* `canBack: boolean`：是否可以回退到上一页，如果为导航栈第一页，则设置为`false`。
* `initFunc: (param) => void`：初始化方法，根据调用后的队列大小，来决定是否启动加载队列。`param`的格式如下：
  * `props: object`：导航内部的参数，是`navigation.state.params`。
  * `item: object`：当前正在处理的任务项。
  * `push: (value, key) => void`：在队列中增加一项任务，`key`是等待队列判重的键，`value`是任务队列的任务项。
  * `isWaiting: (key) => boolean`：判断键`key`是否正在等待队列中等待。
  * `finish: (status, isStop) => void`：结束当前任务，`status`表示任务是否成功，`isStop`表示是否停止加载进程。
* `processFunc: (param) => void`：处理任务的方法，`param`与`initFunc`的相同格式和含义。
* `componentFunc: (props) => object`：最后渲染`WrappedComponent`之前，对于`navigation.state.params`这个导航内部参数的处理，返回处理后的内部参数。
* `errorTitle: string`：错误页面的标题。
* `errorIcon: ImageSource`：错误页面的图标。
* `errorTip: string`：错误页面的文字提示。

另外，还导出了`ErrorPage`这个错误页面组件，该组件有如下参数：

* `icon: ImageSource`：错误图标。
* `text: string`：错误提示文本。
* `onPress: () => void`：点击错误图标的回调方法。