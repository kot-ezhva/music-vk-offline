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
import RNFetchBlob from 'react-native-fetch-blob';

export default class PlayerPage extends React.Component {
    player;
    sliderUpdating;

    constructor(props) {
        super(props);
        this.state = {
            track: {},
            randomize: false,
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
        if (this.player) {
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
        if (this.player) {
            AsyncStorage.getItem("musicItems").then((items) => {
                if (items) {
                    items = JSON.parse(items);

                    for (let i = 0; i < items.length; i++) {
                        if (items[i].primaryKey === this.state.track.primaryKey) { // Текущий трек
                            let nextTrack = (back) ? items[i + 1] : items[i - 1];

                            if(this.state.randomize) { // TODO: Потенциальное зацикливание пишу
                                nextTrack = this.getRandomTrack(items);
                                if(nextTrack.path === this.state.track.path) {
                                    nextTrack = this.getRandomTrack(items);
                                }
                            }

                            if(nextTrack) {
                                this.setState({
                                    track: nextTrack,
                                    sliderState: 0,
                                    currentTime: "0:00",
                                    fullTime: "0:00"
                                }, () => {
                                    this.createPlayerInstance();
                                });
                                break;
                            }
                        }
                    }
                }
            });
        }
    }

    getRandomTrack(items) {
        let min = 0;
        let max = items.length - 1;
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return items[rand];
    }

    getFormattedFromSeconds(sec): String {
        let minutes = Math.floor(sec / 60);
        let seconds = Math.round(sec - minutes * 60);
        if (seconds <= 9) {
            seconds = "0" + seconds.toString();
        }
        return minutes + ":" + seconds;
    }

    remoteTrack(state) {
        if (this.player) {
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
        if (this.player) {
            this.setState({
                isPlaying: true
            });
            this.player.play(() => this.nextTrack(false));
        }
    }

    pause() {
        if (this.player) {
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

    toggleRandomize() {
        this.setState({
            randomize: !this.state.randomize
        });
    }

    deleteTrack(): void {
        AsyncStorage.getItem("musicItems").then((items) => {
            if (items) {
                items = JSON.parse(items);

                for (let i = 0; i < items.length; i++) {
                    if (items[i].primaryKey === this.state.track.primaryKey) {
                        let needToDelete = true;
                        for (let iter = 0; iter < items.length; iter++) {
                            if(this.state.track.path === items[iter].path) {
                                needToDelete = false;
                            }
                        }

                        if(needToDelete) {
                            RNFetchBlob.fs.unlink(this.state.track.path).then(() => {
                                if (items.length === 1) {
                                    AsyncStorage.removeItem("musicItems").then(() => {
                                        this.props.navigation.goBack();
                                    });
                                } else {
                                    items.splice(i, 1);
                                    AsyncStorage.setItem("musicItems", JSON.stringify(items)).then(() => {
                                        this.props.navigation.goBack();
                                    });
                                }
                            });
                        } else {
                            items.splice(i, 1);
                            AsyncStorage.setItem("musicItems", JSON.stringify(items)).then(() => {
                                this.props.navigation.goBack();
                            });
                        }

                    }
                }
            }
        });
    }

    render() {
        return (
            <Image source={require("../assets/background.png")} style={st.container}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "flex-start",
                        padding: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Icon name="md-arrow-back" size={26} color="#fff"/>
                    </TouchableOpacity>

                    <Text style={{
                        flex: 1
                    }}/>

                    <TouchableOpacity
                        onPress={() => this.deleteTrack()}
                        activeOpacity={0.8}
                    >
                        <Icon name="md-trash" size={26} color="#fff"/>
                    </TouchableOpacity>
                </View>
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

                <View style={st.playingOptionsLine}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => this.toggleRandomize()}
                    >
                        {
                            this.state.randomize
                            &&
                            <Icon name="md-shuffle" size={25} color="#FFF"/>
                        }
                        {
                            !this.state.randomize
                            &&
                            <Icon name="md-shuffle" size={25} color="#888"/>
                        }
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
        marginBottom: 20,
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
    playingOptionsLine: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 50
    }
};