import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";

export default class PlayerPage extends React.Component {
    player;
    static navigationOptions = ({navigation}) => ({
        title: navigation.state.params.track.author + " — " + navigation.state.params.track.songName,
        headerTruncatedBackTitle: "Назад",
        headerStyle: {
            //backgroundColor: "#2196F3"
        },
        //statusBarStyle: 'light-content',
    });

    constructor(props) {
        super(props);
        this.state = {
            track: {},
            isPlaying: false
        };
    }

    componentDidMount() {
        let {params} = this.props.navigation.state;
        this.setState({
            track: params.track
        });
    }

    componentWillUnmount() {
        if (this.player) {
            this.player.pause();
            this.player.stop();
            this.player.release();
            this.player = null;
        }
    }

    pause() {
        this.player.pause();
        this.setState({
            isPlaying: false
        });
    }

    play() {
        if (this.player) {
            this.player.pause();
            this.player.stop();
            this.player.release();
            this.player = null;
            return;
        }

        this.setState({
            isPlaying: true
        });

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
        return (
            <View style={st.container}>
                <Image
                    style={{
                        width: 200,
                        height: 200,
                        marginBottom: 50,
                        borderRadius: 400
                    }}
                    source={{
                        uri: this.state.track.picture
                    }}
                />
                {
                    this.state.isPlaying
                    &&
                    <TouchableOpacity
                        onPress={() => this.pause()}
                    >
                        <Icon
                            name="md-pause"
                            color="#FFF"
                            size={50}
                        />
                    </TouchableOpacity>
                }
                {
                    !this.state.isPlaying
                    &&
                    <TouchableOpacity
                        onPress={() => this.play()}
                    >
                        <Icon name="md-play" color="#FFF" size={50}/>
                    </TouchableOpacity>
                }


            </View>
        );
    }
}

const st = {
    container: {
        flex: 1,
        backgroundColor: "#727272",
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
    }
};