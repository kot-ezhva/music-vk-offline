import React from "react";
import {
    View,
    ListView,
    AsyncStorage,
    TouchableOpacity,
    Text,
    Image,
    RefreshControl
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default class AudioPage extends React.Component {

    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            refreshing: false,
            dataSource: ds,
        };
    }

    reloadList(): void {
        this.setState({refreshing: true});
        AsyncStorage.getItem("musicItems").then((items) => {
            if (items) {
                console.log("TRACK", items);
                items = JSON.parse(items).reverse();
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(items)
                });
            }
            this.setState({refreshing: false});
        });
    }

    componentDidMount() {
        this.reloadList();
    }

    onTrackPress(track) {
        this.props.navigation.navigate("Player", {
            track: track
        });
    }

    render() {
        return (
            <View style={st.container}>
                <ListView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.reloadList.bind(this)}
                        />
                    }
                    style={{alignSelf: "stretch", height: "100%"}}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <TouchableOpacity
                            onPress={() => this.onTrackPress(rowData)}
                            style={st.listItem}
                            activeOpacity={0.9}
                        >
                            {
                                rowData.picture
                                &&
                                <Image
                                    source={{
                                        uri: rowData.picture
                                    }}
                                    style={st.playImage}
                                />
                            }

                            {
                                !rowData.picture
                                &&
                                <View
                                    style={[st.playImage, {
                                        backgroundColor: "#eee",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }]}
                                >
                                    <Icon
                                        name="ios-musical-notes-outline"
                                        color="#727272"
                                        size={30}
                                    />
                                </View>
                            }


                            <View style={st.descContainer}>
                                <Text style={st.artist}>{rowData.author}</Text>
                                <Text style={st.songName}>{rowData.songName}</Text>
                            </View>

                            <View style={st.durationContainer}>
                                <Text style={st.duration}>{rowData.duration}</Text>
                            </View>

                        </TouchableOpacity>
                    }
                />

            </View>
        );
    }
}

const st = {
    container: {
        backgroundColor: "#FFF"
    },
    listItem: {
        flexDirection: "row",
        padding: 10,
    },
    playImage: {
        height: 80,
        width: 80,
        borderRadius: 5
    },
    descContainer: {
        paddingHorizontal: 10,
        justifyContent: "center",

    },
    artist: {
        fontSize: 20,
        fontWeight: "300"
    },
    songName: {},
    durationContainer: {
        marginLeft: "auto",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 5
    },
    duration: {},
};