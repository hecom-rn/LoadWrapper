import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import withBasicWrapper from '@hecom/wrapper-basic';
import Foundation from '@hecom/foundation';
import ErrorPage from './ErrorPage';

export default (WrappedComponent, options) => {
    return class extends React.PureComponent {
        static navigationOptions = ({navigation}) => {
            const {_title} = navigation.state.params;
            let navOptions = {};
            if (_title !== null) {
                if (options.canBack === false) {
                    navOptions.headerLeft = null;
                }
                navOptions.title = _title;
            } else {
                navOptions = WrappedComponent.navigationOptions || {header: null};
            }
            return navOptions;
        };

        innerProps = {};
        queue = [];
        waitings = {};
        
        constructor(props) {
            super(props);
            this.innerProps = props.navigation.state.params || {};
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
                const props = componentFunc ? componentFunc(this.innerProps) : this.innerProps;
                const WrappedClass = withBasicWrapper(WrappedComponent);
                const newProps = {...this.props};
                delete newProps._title;
                newProps.navigation.state.params = {...props};
                return <WrappedClass {...newProps} />;
            }
        }

        _options = (item) => ({
            item: item,
            props: this.innerProps,
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
            const state = {...this.state};
            const navOptions = {};
            if (isLoading !== undefined) {
                state.isLoading = isLoading;
                if (isLoading) {
                    navOptions._title = '加载中';
                }
            }
            if (isValid !== undefined) {
                state.isValid = isValid;
                if (!isLoading) {
                    if (isValid) {
                        navOptions._title = null;
                    } else {
                        navOptions._title = options.errorTitle;
                    }
                }
            }
            this.props.navigation.setParams(navOptions);
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