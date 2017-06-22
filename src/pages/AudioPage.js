import React from "react";
import {
    View,
    ListView,
    AsyncStorage,
    TouchableOpacity,
    Text,
    Image,
    RefreshControl,
    Dimensions
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
const window = Dimensions.get("window");

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

            console.log(items);

            if (items && items.length !== 2) {
                items = JSON.parse(items).reverse();
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(items)
                });
            } else {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(['empty'])
                });
            }
            this.setState({refreshing: false});

        });
    }

    componentWillMount() {
        this.reloadList();
    }

    onTrackPress(track) {
        this.props.navigation.navigate("Player", {
            track: track
        });
    }

    render() {
        return (
            <View style={st.container} >
                <ListView
                    enableEmptySections={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.reloadList.bind(this)}
                        />
                    }
                    style={{alignSelf: "stretch", height: "100%"}}
                    dataSource={this.state.dataSource}
                    renderRow={(rowData) => {
                        if(rowData === "empty") {
                            return(
                                <View style={{
                                    flex: 1,
                                    height: window.height - 50,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1
                                }}>
                                    <Text style={{
                                        fontSize: 27,
                                        fontWeight: "100",
                                        textAlign: "center",
                                        padding: 10
                                    }}>
                                        Потяните вниз,{"\n"}чтобы обновить
                                    </Text>
                                </View>
                            );
                        }
                        return(
                            <TouchableOpacity
                                onPress={() => this.onTrackPress(rowData)}
                                style={st.listItem}
                                activeOpacity={0.9}
                            >
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
                                {
                                    !!rowData.picture
                                    &&
                                    <Image
                                        source={{
                                            uri: rowData.picture
                                        }}
                                        style={st.playImage}
                                    />
                                }

                                <View style={st.descContainer}>
                                    <Text style={st.artist}>{rowData.author}</Text>
                                    <Text style={st.songName}>{rowData.songName}</Text>
                                </View>

                            </TouchableOpacity>
                        );
                    }

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
        paddingVertical: 5
    },
    playImage: {
        height: 80,
        width: 80,
        backgroundColor: "#eee",
        borderRadius: 5,
    },
    descContainer: {
        flex: 1,
        alignSelf: "stretch",
        paddingHorizontal: 10,
        justifyContent: "center",
        backgroundColor: "#fff",
    },
    artist: {
        fontSize: 20,
        fontWeight: "300"
    },
    songName: {},
};