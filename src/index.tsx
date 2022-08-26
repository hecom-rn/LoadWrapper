import React from 'react';
import { ActivityIndicator, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import withBasicWrapper from '@hecom/wrapper-basic';
import LottieView from 'lottie-react-native';
import ErrorPage, * as ErrorPageItems from './ErrorPage';

export interface Params<T = any> {
    props: any;
    item: T;
    push: (value: T, key: string) => void;
    isWaiting: (key: string) => boolean;
    finish: (status: boolean, isStop: boolean) => void
}

export interface Options<T = any> {
    canBack: boolean;
    initFunc?: (param: Params<T>) => void;
    processFunc?: (param: Params<T>) => void ;
    componentFunc?: (props: any) => any;
    activityLottiePath?: string;
    activityLottieImagePath?: string;
    errorTitle?: string;
    errorPageOptions?: ErrorPageItems.Props;
    loadingViewStyle: StyleProp<ViewStyle>;
}

export default function <T = any> (
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

        private queue: T[] = [];
        private waitings: {[key: string]: boolean} = {};

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

        render() {
            const {isLoading, isValid} = this.state;
            if (isLoading) {
                return (
                    <View style={[styles.loading, options.loadingViewStyle]}>
                        {options.activityLottiePath ? 
                            <LottieView
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
                finish: this._finishItem.bind(this),
            };
        }

        protected _processQueue() {
            if (this.queue.length === 0) {
                this._changeStatus(false, true);
            } else {
                options.processFunc && options.processFunc(this._options(this.queue[0]));
            }
        }

        protected _finishItem(status: boolean, isStop: boolean = false) {
            if (status) {
                if (this.queue.length > 1) {
                    this.queue = this.queue.slice(1);
                } else {
                    this.queue = [];
                }
                if (!isStop) {
                    setTimeout(this._processQueue.bind(this), 0);
                }
            } else {
                this._changeStatus(false, false);
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
                    navOptions._title = '加载中';
                }
            } else {
                if (isValid) {
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