import React from "react";
import {
    View,
    Text
} from "react-native";
import Sound from "react-native-sound";

export default class PlayerPage extends React.Component {
    player;
    constructor(props) {
        super(props);
        this.state = {
            track: {}
        };
    }
    componentDidMount() {
        let { params } = this.props.navigation.state;
        this.setState({
            track: params.track
        });
    }

    play() {
        if (this.player) {
            this.player.stop();
            this.player.release();
            this.player = null;
            return;
        }

        this.player = new Sound(
            this.state.track.path,
            '',
            (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    return;
                }
                this.player.play();
            });
    }

    render() {
        return(
            <View>
                <Text onPress={() => this.play()}>{this.state.track.author}</Text>
            </View>
        );
    }
}