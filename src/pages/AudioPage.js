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
                    style={{alignSelf: "stretch"}}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) =>
                        <TouchableOpacity
                            onPress={() => this.onTrackPress(rowData)}
                            style={st.listItem}
                        >
                            <Image
                                source={require("../assets/icons/play.png")}
                                style={st.playImage}
                            />

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
        padding: 5,
        width: "100%",
    },
    playImage: {
        height: 50,
        width: 50
    },
    descContainer: {
        paddingLeft: 5,
        justifyContent: "center",

    },
    artist: {
        fontWeight: "bold"
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