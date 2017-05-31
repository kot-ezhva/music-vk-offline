import React from "react";
import { StackNavigator, TabNavigator, TabBarBottom } from "react-navigation";
import Icon from "react-native-vector-icons/Ionicons";
import DownloadPage from "./pages/DownloadPage";
import AudioPage from "./pages/AudioPage";
import SettingsPage from "./pages/SettingsPage";
import PlayerPage from "./pages/PlayerPage";

const MainApp = TabNavigator({
    DownloadPage: {
        screen: DownloadPage,
        navigationOptions: {
            tabBarIcon: ({focused}) => {
                if (focused) {
                    return (<Icon name="ios-cloud-download-outline" size={30} color="#4d7199"/>);
                } else {
                    return (<Icon name="ios-cloud-download-outline" size={30} color="#9E9E9E"/>);
                }
            }
        }
    },
    AudioPage: {
        screen: AudioPage,
        navigationOptions: {
            tabBarIcon: ({focused}) => {
                if (focused) {
                    return (<Icon name="ios-musical-notes-outline" size={30} color="#4d7199"/>);
                } else {
                    return (<Icon name="ios-musical-notes-outline" size={30} color="#9E9E9E"/>);
                }
            }
        },
    },
    /*SettingsPage: {
        screen: SettingsPage,
        navigationOptions: {
            tabBarIcon: ({focused}) => {
                if (focused) {
                    return (<Icon name="ios-construct-outline" size={30} color="#4d7199"/>);
                } else {
                    return (<Icon name="ios-construct-outline" size={30} color="#9E9E9E"/>);
                }
            },
        }
    }*/
}, {
    tabBarComponent: ({jumpToIndex, ...props, navigation}) => (
        <TabBarBottom
            {...props}
            jumpToIndex={index => {
                jumpToIndex(index);
            }}
        />

    ),
    tabBarPosition: "bottom",
    animationEnabled: false,
    swipeEnabled: false,
    lazy: false,
    tabBarOptions: {
        showLabel: false
    },
});

const MusicVkApp = StackNavigator({
    MainApp: {
        screen: MainApp,
        navigationOptions: {
            header: null
        }
    },
    Player: {
        screen: PlayerPage,
        navigationOptions: {
            header: null,
            statusBarStyle: 'light-content',

        }
    }
});


export default MusicVkApp;