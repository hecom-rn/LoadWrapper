import withBasicWrapper from '@hecom/wrapper-basic';
import LottieView from 'lottie-react-native';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import ErrorPage, * as ErrorPageItems from './ErrorPage';

type QueueItemType = any & { isLowPriority?: boolean };

export interface Params<T = QueueItemType> {
    props: any;
    item: T;
    push: (value: T, key: string) => void;
    isWaiting: (key: string) => boolean;
    waitKey: (key: string) => void;
    finish: (status: boolean, isStop: boolean) => void
}

export interface Options<T = QueueItemType> {
    canBack: boolean;
    loadFinishFunc?: () => void;
    initFunc?: (param: Params<T>) => void;
    processFunc?: (param: Params<T>) => Promise<boolean>;
    componentFunc?: (props: any) => any;
    activityLottiePath?: string;
    activityLottieImagePath?: string;
    errorTitle?: string;
    loadingTitle?: string;
    errorPageOptions?: ErrorPageItems.Props;
    loadingViewStyle: StyleProp<ViewStyle>;
}

export default function <T = QueueItemType> (
    OutterComponent: React.ComponentClass,
    options: Options<T>
) {
    const WrappedComponent = withBasicWrapper(OutterComponent);
    return class extends React.PureComponent {
        static navigationOptions = (opt) => {
            const {route} = opt;
            const {_title} = route.params ? route.params : {};
            let navOptions = {};
            if (_title !== null) {
                if (options.canBack === false) {
                    navOptions.headerLeft = ()=>{};
                }
                navOptions.title = _title;
            } else if (WrappedComponent.navigationOptions) {
                const isFunc = typeof WrappedComponent.navigationOptions === 'function';
                navOptions = isFunc ? WrappedComponent.navigationOptions(opt) : WrappedComponent.navigationOptions;
                navOptions.title = !!navOptions.title ? navOptions.title : '';
            } else {
                navOptions = {headerShown: false};
                navOptions.title = !!navOptions.title ? navOptions.title : '';
            }
            return navOptions;
        };

        private queue: (T & { isLowPriority?: boolean })[] = [];
        private waitings: {[key: string]: boolean} = {};
        private lottieView: LottieView;

        constructor(props) {
            super(props);
            options.initFunc && options.initFunc(this._options());
            this.hasInitialQueue = this.queue.length > 0;
            this.state = this._changeStatus(this.hasInitialQueue, !this.hasInitialQueue, true);
        }

        componentDidMount() {
            if (this.hasInitialQueue) {
                setTimeout(this._processQueue.bind(this), 0);
            }
        }

        componentWillUnmount(): void {
            if (this.lottieView) {
                this.lottieView.pause();
                this.lottieView = null;
            }
        }

        render() {
            const {isLoading, isValid} = this.state;
            if (!isLoading && this.lottieView) {
                this.lottieView.pause();
                this.lottieView = null;
            }
            if (isLoading) {
                return (
                    <View style={[styles.loading, options.loadingViewStyle]}>
                        {options.activityLottiePath ?
                            <LottieView
                                ref={(ref) => {
                                    this.lottieView = ref;
                                }}
                                source={options.activityLottiePath}
                                loop={true}
                                autoPlay={true}
                                resizeMode={'contain'}
                                style={{height: 150, width: 150}}
                                imageAssetsFolder={options.activityLottieImagePath || ''}
                            /> : <ActivityIndicator />}
                    </View>
                );
            } else if (!isValid) {
                return (
                    <ErrorPage
                        {...options.errorPageOptions}
                        onPress={() => {
                            this._changeStatus(true, false);
                            setTimeout(this._processQueue.bind(this), 0);
                        }}
                    />
                );
            } else {
                const {componentFunc} = options;
                const innerProps = this.props.route.params || {};
                const props = componentFunc ? componentFunc(innerProps) : innerProps;
                const WrappedClass = WrappedComponent;
                const newProps = {...props, route: this.props.route, navigation: this.props.navigation};
                newProps.route.params = {
                    ...props,
                    _title: null,
                };
                return <WrappedClass {...newProps} />;
            }
        }

        protected _options(item: T) {
            return {
                item: item,
                props: this.props.route.params || {},
                push: (obj: T, key: string) => {
                    this.queue.push(obj);
                    this.waitings[key] = true;
                },
                isWaiting: (key: string) => this.waitings[key],
                waitKey: (key: string) => this.waitings[key] = true,
            };
        }

        protected _processQueue() {
            if (this.queue.length === 0) {
                this._changeStatus(false, true);
            } else {
                console.log(this.queue.length, '************start request this.queue.length************');
                // 保存当前队列的副本并清空原队列，优先级较低的请求放到最后处理
                let queueCopy: (T & { isLowPriority?: boolean })[] = [];
                this.queue = this.queue.reduce((pre, item) => {
                    if (item.isLowPriority) {
                        pre.push(item);
                    } else {
                        queueCopy.push(item);
                    }
                    return pre;
                }, [] as (T & { isLowPriority?: boolean })[]);
                if (queueCopy.length === 0) {
                    queueCopy = [...this.queue];
                    this.queue = [];
                }

                Promise.all(queueCopy.map((item) => {
                    return options.processFunc ? options.processFunc(this._options(item)) : Promise.resolve(true);
                })).then(() => {
                    setTimeout(this._processQueue.bind(this), 0);
                }).catch(() => {
                    // 恢复执行失败的任务到队列头部，防止任务丢失
                    this.queue = [...queueCopy, ...this.queue];
                    this._changeStatus(false, false);
                });
            }
        }

        protected _changeStatus(
            isLoading: boolean,
            isValid: boolean,
            isInitial: boolean = false
        ) {
            const state = {isLoading, isValid};
            const navOptions = {};
            if (isLoading) {
                if (isInitial || !this.state.isLoading) {
                    navOptions._title = options.loadingTitle || '加载中';
                }
            } else {
                if (isValid) {
                    options.loadFinishFunc && options.loadFinishFunc();
                    navOptions._title = null;
                } else {
                    navOptions._title = options.errorTitle;
                }
            }
            if (navOptions._title !== undefined) {
                this.props.navigation.setParams(navOptions);
            }
            if (isInitial) {
                return state;
            } else {
                this.setState(state);
            }
        }
    };
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
