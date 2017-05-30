import React from "react";
import {
    View,
    Text,
    WebView
} from "react-native";

export default class SettingsPage extends React.Component {
    constructor() {
        super();
        this.state = {
        };
    }

    render() {
        return (
            <View style={st.container}>
                <Text>Settings Page</Text>
            </View>
        );
    }
}

const st = {
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFF"
    }
};