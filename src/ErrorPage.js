import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import PropTypes from 'prop-types';

export default class extends React.PureComponent {
    static propTypes = {
        icon: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
        text: PropTypes.string,
        onPress: PropTypes.func,
    };

    render() {
        const { icon, text, onPress } = this.props;
        return (
            <View style={styles.view}>
                <TouchableOpacity style={styles.touch} onPress={onPress}>
                    <View style={styles.container}>
                        <Image source={icon} style={styles.image} />
                        <Text style={styles.text}>
                            {text}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    touch: {
        marginTop: 150,
        padding: 20,
    },
    container: {
        flex: 1,
        alignItems: 'center',
    },
    image: {
        width: 70,
        height: 70,
    },
    text: {
        marginTop: 15,
        fontSize: 15,
        color: '#999999',
    },
});