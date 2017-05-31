import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Slider,
    AsyncStorage
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Sound from "react-native-sound";

export default class PlayerPage extends React.Component {
    player;
    sliderUpdating;

    constructor(props) {
        super(props);
        this.state = {
            track: {},
            sliderState: 0,
            isPlaying: false,
            currentTime: "0:00",
            fullTime: "0:00"
        };
    }

    componentDidMount() {
        let {params} = this.props.navigation.state;
        this.setState({
            track: params.track
        }, () => {
            this.createPlayerInstance();
        });
    }

    createPlayerInstance() {
        if(this.player) {
            clearInterval(this.sliderUpdating);
            this.player.pause();
            this.player.stop();
            this.player.release();
            this.player = null;
        }

        this.player = new Sound(
            this.state.track.path,
            "",
            (error) => {
                if (error) {
                    console.log('failed to load the sound', error);
                    return;
                }

                this.sliderUpdating = setInterval(() => {
                    this.player.getCurrentTime((seconds) => {
                        this.setState({
                            sliderState: seconds / this.player.getDuration(),
                            currentTime: this.getFormattedFromSeconds(seconds),
                            fullTime: this.getFormattedFromSeconds(this.player.getDuration())
                        });
                    });
                }, 500);
                this.play();
            });
    }

    nextTrack(back: boolean) {
        if(this.player) {
            AsyncStorage.getItem("musicItems").then((items) => {
                if(items) {
                    items = JSON.parse(items);
                    let nextTrackPk;
                    if(back) {
                        nextTrackPk = this.state.track.primaryKey + 1;
                    } else {
                        nextTrackPk = this.state.track.primaryKey - 1;
                    }

                    for(let i = 0; i < items.length; i++) {
                        if(items[i].primaryKey === nextTrackPk) {
                            this.setState({
                                track: items[i],
                                sliderState: 0,
                                currentTime: "0:00",
                                fullTime: "0:00"
                            }, () => {
                                this.createPlayerInstance();
                            });
                        }
                    }
                }
            });
        }
    }

    getFormattedFromSeconds(sec): String {
        let minutes = Math.floor(sec / 60);
        let seconds = Math.round(sec - minutes * 60);
        if(seconds <= 9) {
            seconds = "0" + seconds.toString();
        }
        return minutes + ":" + seconds;
    }

    remoteTrack(state) {
        if(this.player) {
            this.player.pause();
            let seconds = this.player.getDuration() * state;
            this.player.setCurrentTime(seconds);
            this.setState({
                sliderState: state,
                isPlaying: true
            });
            this.play();
        }
    }

    play() {
        if(this.player) {
            this.setState({
                isPlaying: true
            });
            this.player.play(() => this.nextTrack(false));
        }
    }

    pause() {
        if(this.player) {
            this.setState({
                isPlaying: false
            });
            this.player.pause();
        }
    }

    componentWillUnmount() {
        clearInterval(this.sliderUpdating);
        this.player.pause();
        this.player.stop();
        this.player = null;
    }

    render() {
        return (
            <Image source={require("../assets/background.png")} style={st.container}>
                {
                    !!this.state.track.picture
                    &&
                    <Image
                        style={{
                            width: 160,
                            height: 160,
                            marginBottom: 20,
                            borderRadius: 320,
                        }}
                        source={{
                            uri: this.state.track.picture
                        }}
                    />
                }

                {
                    !this.state.track.picture
                    &&
                    <View style={{
                        width: 160,
                        height: 160,
                        backgroundColor: "#727272",
                        borderRadius: 320,
                        marginBottom: 20,
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Icon
                            name="ios-musical-notes-outline"
                            color="#FFF"
                            size={80}
                        />
                    </View>
                }

                <View style={st.trackInfo}>
                    <Text style={st.author}>{this.state.track.author}</Text>
                    <Text style={st.songName}>{this.state.track.songName}</Text>
                </View>

                <View style={st.controlLine}>
                    <TouchableOpacity
                        onPress={() => this.nextTrack(true)}
                        style={st.controlItem}
                    >
                        <Icon name="md-rewind" color="#FFF" size={40}/>
                    </TouchableOpacity>

                    {
                        !this.state.isPlaying
                        &&
                        <TouchableOpacity
                            onPress={() => {
                                this.play();
                            }}
                            style={st.controlItem}
                        >
                            <Icon name="md-play" color="#FFF" size={80}/>
                        </TouchableOpacity>
                    }
                    {
                        this.state.isPlaying
                        &&
                        <TouchableOpacity
                            onPress={() => {
                                this.pause();
                            }}
                            style={st.controlItem}
                        >
                            <Icon name="md-pause" color="#FFF" size={80}/>
                        </TouchableOpacity>
                    }

                    <TouchableOpacity
                        onPress={() => this.nextTrack(false)}
                        style={st.controlItem}
                    >
                        <Icon name="md-fastforward" color="#FFF" size={40}/>
                    </TouchableOpacity>
                </View>

                <View style={st.timeLine}>
                    <Text style={st.timeStart}>{this.state.currentTime}</Text>
                    <Text style={st.timeEnd}>{this.state.fullTime}</Text>
                </View>

                <Slider
                    maximumTrackTintColor={"#eee"}
                    minimumTrackTintColor={"#eee"}
                    thumbTintColor={"#FFF"}
                    value={this.state.sliderState}
                    style={st.slider}
                    onValueChange={(value) => this.player.pause()}
                    onSlidingComplete={(value) => this.remoteTrack(value)}/>

            </Image>
        );
    }
}

const st = {
    container: {
        flex: 1,
        width: null,
        height: null,
        justifyContent: "center",
        alignItems: "center",
        padding: 15,
    },
    controlLine: {
        flexDirection: "row",
        marginBottom: 50
    },
    controlItem: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 30
    },
    slider: {
        width: "100%"
    },
    trackInfo: {
        marginBottom: 50
    },
    author: {
        color: "#fff",
        fontSize: 30,
        fontWeight: "100",
        textAlign: "center",
        marginBottom: 10
    },
    songName: {
        color: "#fff",
        textAlign: "center",
    },
    timeLine: {
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    timeStart: {
        paddingHorizontal: 15,
        color: "#FFF",
        flex: 1
    },
    timeEnd: {
        paddingHorizontal: 15,
        color: "#FFF",
    },
};