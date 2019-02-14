import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import withBasicWrapper from '@hecom/wrapper-basic';
import Foundation from '@hecom/foundation';
import ErrorPage from './ErrorPage';

export default (OutterComponent, options) => {
    const WrappedComponent = withBasicWrapper(OutterComponent);
    return class extends React.PureComponent {
        static navigationOptions = (opt) => {
            const {navigation} = opt;
            const {_title} = navigation.state.params;
            let navOptions = {};
            if (_title !== null) {
                if (options.canBack === false) {
                    navOptions.headerLeft = null;
                }
                navOptions.title = _title;
            } else if (WrappedComponent.navigationOptions) {
                const isFunc = typeof WrappedComponent.navigationOptions === 'function';
                navOptions = isFunc ? WrappedComponent.navigationOptions(opt) : WrappedComponent.navigationOptions;
            } else {
                navOptions = {header: null};
            }
            return navOptions;
        };

        queue = [];
        waitings = {};

        constructor(props) {
            super(props);
            options.initFunc && options.initFunc(this._options());
            this.hasInitialQueue = this.queue.length > 0;
            this.state = this._changeStatus(this.hasInitialQueue, !this.hasInitialQueue, true);
        }

        componentDidMount() {
            if (this.hasInitialQueue) {
                setTimeout(() => this._processQueue(), 0);
            }
        }

        render() {
            const {isLoading, isValid} = this.state;
            if (isLoading) {
                return (
                    <View style={[styles.loading, Foundation.Style.ViewBackground]}>
                        <ActivityIndicator />
                    </View>
                );
            } else if (!isValid) {
                return (
                    <ErrorPage
                        icon={options.errorIcon}
                        text={options.errorTip}
                        onPress={() => {
                            this._changeStatus(true, false);
                            setTimeout(this._processQueue, 0);
                        }}
                    />
                );
            } else {
                const {componentFunc} = options;
                const innerProps = this.props.navigation.state.params || {};
                const props = componentFunc ? componentFunc(innerProps) : innerProps;
                const WrappedClass = WrappedComponent;
                const newProps = {...props, navigation: this.props.navigation};
                newProps.navigation.state.params = {
                    ...props,
                    _title: null,
                };
                return <WrappedClass {...newProps} />;
            }
        }

        _options = (item) => ({
            item: item,
            props: this.props.navigation.state.params || {},
            push: (obj, key) => {
                this.queue.push(obj);
                this.waitings[key] = true;
            },
            isWaiting: (key) => this.waitings[key],
            finish: this.finishItem
        });

        _processQueue = () => {
            if (this.queue.length === 0) {
                this._changeStatus(false, true);
            } else {
                options.processFunc && options.processFunc(this._options(this.queue[0]));
            }
        };

        finishItem = (status, isStop = false) => {
            if (status) {
                if (this.queue.length > 1) {
                    this.queue = this.queue.slice(1);
                } else {
                    this.queue = [];
                }
                if (!isStop) {
                    setTimeout(this._processQueue, 0);
                }
            } else {
                this._changeStatus(false, false);
            }
        };

        _changeStatus = (isLoading, isValid, isInitial = false) => {
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
        };
    };
};

export {
    ErrorPage,
};

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});