import React from 'react';
import { View, TouchableOpacity, Image, Text, ImageSourcePropType, StyleProp, ImageStyle, TextStyle, ViewStyle } from 'react-native';

export interface Props {
    icon: ImageSourcePropType;
    iconStyle?: StyleProp<ImageStyle>;
    text: string;
    textStyle: StyleProp<TextStyle>;
    viewStyle: StyleProp<ViewStyle>;
    touchStyle: StyleProp<ViewStyle>;
    containerStyle: StyleProp<ViewStyle>;
    onPress: () => void;
}

export default class extends React.PureComponent<Props> {
    static defaultProps = {
        viewStyle: {
            flex: 1,
            alignItems: 'center',
            backgroundColor: 'white',
        },
        touchStyle: {
            marginTop: 150,
            padding: 20,
        },
        containerStyle: {
            flex: 1,
            alignItems: 'center',
        },
        textStyle: {
            marginTop: 15,
            fontSize: 15,
            color: '#999999',
        },
    };

    render() {
        const { icon, iconStyle, text, textStyle, viewStyle, touchStyle, containerStyle, onPress } = this.props;
        return (
            <View style={viewStyle}>
                <TouchableOpacity style={touchStyle} onPress={onPress}>
                    <View style={containerStyle}>
                        <Image source={icon} style={iconStyle} />
                        <Text style={textStyle}>
                            {text}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}