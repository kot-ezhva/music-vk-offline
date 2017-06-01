import React from "react";
import WebViewBridge from 'react-native-webview-bridge';
import RNFetchBlob from 'react-native-fetch-blob';
import {
    AsyncStorage,
    View,
    ActivityIndicator,
    Dimensions,
    Text,
    TouchableOpacity
} from "react-native";

const window = Dimensions.get("window");

export default class DownloadPage extends React.Component {
    webViewBridge;

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            showProgress: false,
            progressSize: 0,
            fullSize: 0
        };
    }

    onBridgeMessage(message) {
        if (message === "loaded") {
            this.setState({
                loaded: true
            });
            return;
        }
        this.setState({
            showProgress: true
        });
        let songData = JSON.parse(message);
        let url = songData.url;

        let dirs = RNFetchBlob.fs.dirs;

        let filename = "/" + url.substring(url.lastIndexOf('/') + 1);
        filename = filename.split("?")[0];

        RNFetchBlob
            .config({
                path: dirs.DocumentDir + filename,
            })
            .fetch('GET', url, {
                //some headers ..
            })
            .progress((received, total) => {
                this.setState({
                    progressSize: (received / 1024 / 1024).toFixed(2) + "Mb",
                    fullSize: (total / 1024 / 1024).toFixed(2) + "Mb"
                });
            })
            .then((res) => {
                this.saveAudio({
                    primaryKey: 1,
                    author: songData.author,
                    songName: songData.songName,
                    path: res.path(),
                    picture: songData.picture
                });
            })
    }

    vkScript() {
        return `
if(window.location.href === "https://m.vk.com/audio") {
    document.getElementsByClassName("layout__header")[0].remove();
    document.getElementsByClassName("layout__leftMenu")[0].remove();
    document.getElementsByClassName("basis__header")[0].remove();
    document.getElementsByClassName("basis__footer")[0].remove();
    document.getElementsByClassName("audioPage__search")[0].remove();
    document.getElementsByClassName("audioPage__header")[0].remove();

    setInterval(function () {
        addDownloadIcons();
    }, 100);

    function addDownloadIcons() {
        var audioElements = document.getElementsByClassName("audio_item");
    
        for (var i = 0; i < audioElements.length; i++) {
            var btn = audioElements[i].getElementsByClassName("ai_menu_toggle_button")[0];
            if(btn && !btn.classList.contains("downloadIcon")) {
                btn.style.backgroundPosition = "0";
                btn.style.backgroundImage = 'url(https://cdn0.iconfinder.com/data/icons/cloudcon/512/download-512.png)';
                btn.classList += " downloadIcon";
                btn.onclick = function(event) {
                    event.stopPropagation();
                    event.preventDefault();
    
                    var musicBody = findAncestor(event.target, "audio_item");
                    var picture = musicBody.getElementsByClassName("ai_play")[0];
                    musicBody = musicBody.getElementsByClassName("ai_body")[0];
    
                    if(musicBody) {
                        var input = musicBody.getElementsByTagName("input")[0];
                        var author = musicBody.getElementsByClassName("ai_artist")[0].innerHTML;
                        var songName = musicBody.getElementsByClassName("ai_title")[0].innerHTML;
                        
                        if(picture) {
                            picture = picture.style.backgroundImage.slice(5, -2);
                        } else {
                            picture = "";
                        }
    
                        var toSend = {
                            url: input.value,
                            author: author,
                            songName: songName,
                            picture: picture
                        };
    
                        WebViewBridge.send(JSON.stringify(toSend));
                    }
                    return false;
                };
            }
        }
    }
    
    function findAncestor (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }
}

if(WebViewBridge) {
    WebViewBridge.onMessage = function (message) {
            
    };
    setTimeout(() => {
        WebViewBridge.send("loaded");
    }, 3000);
}
`;
    }

    async saveAudio(file): void {
        try {
            let musicItems = await AsyncStorage.getItem('musicItems');
            let newPrimaryKey = 1;
            if (musicItems !== null) {
                musicItems = JSON.parse(musicItems);
                newPrimaryKey = musicItems[musicItems.length - 1].primaryKey + 1;
            } else {
                musicItems = [];
            }
            file.primaryKey = newPrimaryKey;
            musicItems.push(file);

            AsyncStorage.setItem("musicItems", JSON.stringify(musicItems));
            this.setState({
                showProgress: false,
                fullSize: 0,
                progressSize: 0
            });

        } catch (error) {
            console.log(error);
        }
    }

    showError() {
        return (
            <View style={st.errorContainer}>
                <Text style={st.errorText}>
                    Ошибка загрузки.{"\n"}Проверьте подключение к интернету и попробуйте снова
                </Text>

                <TouchableOpacity onPress={() => this.webViewBridge.reload()}>
                    <Text style={st.errorBtn}>
                        Попробовать снова
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AudioPage")}>
                    <Text style={st.errorBtn}>
                        Слушать оффлайн
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        return (
            <View style={st.container}>
                {
                    this.state.loaded === false
                    &&
                    <View style={{
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        position: "absolute",
                        alignSelf: "stretch",
                        justifyContent: "center",
                        flex: 1,
                        height: window.height
                    }}>
                        <ActivityIndicator
                            animating={true}
                            style={{
                                height: 80
                            }}
                            size="large"
                        />
                    </View>
                }
                <WebViewBridge
                    ref={(webViewBridge) => this.webViewBridge = webViewBridge}
                    onBridgeMessage={(message) => this.onBridgeMessage(message)}
                    source={{uri: 'https://m.vk.com/audio'}}
                    injectedJavaScript={this.vkScript()}
                    startInLoadingState={true}
                    userAgent={"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"}
                    renderError={() => this.showError()}
                    onError={() => this.setState({loaded: true})}
                    style={{
                        width: window.width,
                        alignSelf: "stretch",
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: (this.state.loaded && this.state.showProgress === false) ? 0 : window.height,
                        bottom: 0,
                    }}
                />

                {
                    this.state.showProgress
                    &&
                    <View style={st.progressContainer}>
                        <Text style={st.progressTitle} >
                            Загрузка...
                        </Text>
                        <Text style={st.progressText}>
                            {this.state.progressSize} из {this.state.fullSize}
                        </Text>
                    </View>
                }
            </View>
        );
    }
}

const st = {
    container: {
        flex: 1,
        justifyContent: "center",
        position: "relative"
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    errorText: {
        fontSize: 22,
        textAlign: "center",
        fontWeight: "100",
        padding: 20,
        marginBottom: 20
    },
    errorBtn: {
        width: window.width - 100,
        fontSize: 18,
        borderWidth: 2,
        textAlign: "center",
        borderRadius: 30,
        padding: 13,
        borderColor: "#555",
        color: "#555",
        marginBottom: 15
    },
    progressContainer: {
        flex: 1,
        alignSelf: "stretch",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#727272",
        justifyContent: "center",
        alignItems: "center"
    },
    progressTitle: {
        fontSize: 30,
        fontWeight: "100",
        color: "#FFF",
        marginBottom: 20
    },
    progressText: {
        color: "#FFF",
        fontWeight: "100",
        fontSize: 25
    }
};