import React from "react";
import WebViewBridge from 'react-native-webview-bridge';
import RNFetchBlob from 'react-native-fetch-blob';
import {AsyncStorage, View, ActivityIndicator, Dimensions, Text, TouchableOpacity} from "react-native";

const window = Dimensions.get("window");

export default class DownloadPage extends React.Component {
    webViewBridge;

    constructor(props) {
        super(props);
        this.state = {
            loaded: false
        };
    }

    onBridgeMessage(message) {
        if (message === "loaded") {
            this.setState({
                loaded: true
            });
            return;
        }
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
                //console.log('progress', received / total);
                //console.log('total', total);
                //TODO: Сделать прогресс загрузки
            })
            .then((res) => {
                this.saveAudio({
                    author: songData.author,
                    songName: songData.songName,
                    path: res.path(),
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
                    musicBody = musicBody.getElementsByClassName("ai_body")[0];

                    if(musicBody) {
                        var input = musicBody.getElementsByTagName("input")[0];
                        var author = musicBody.getElementsByClassName("ai_artist")[0].innerHTML;
                        var songName = musicBody.getElementsByClassName("ai_title")[0].innerHTML;

                        var toSend = {
                            url: input.value,
                            author: author,
                            songName: songName
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

    if(WebViewBridge) {
        WebViewBridge.onMessage = function (message) {
            if(message === "replaceIcons") {
                /*addDownloadIcons();*/
            }
        };
        
        WebViewBridge.send("loaded");
    }
}
`;
    }

    async saveAudio(file): void {
        console.log("saving...");
        try {
            let musicItems = await AsyncStorage.getItem('musicItems');
            if (musicItems !== null) {
                musicItems = JSON.parse(musicItems);
            } else {
                musicItems = [];
            }
            musicItems.push(file);

            AsyncStorage.setItem("musicItems", JSON.stringify(musicItems));
            console.log("saved!");

        } catch (error) {
            console.log(error);
        }
    }

    showError() {
        return(
            <View style={st.errorContainer}>
                <Text style={st.errorText}>
                    Ошибка загрузки.{"\n"}Проверьте подключение к интернету и попробуйте снова
                </Text>

                <TouchableOpacity onPress={() => this.webViewBridge.reload()}>
                    <Text style={st.errorBtn} >
                        Попробовать снова
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("AudioPage")}>
                    <Text style={st.errorBtn} >
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
                        alignSelf: "stretch",
                        justifyContent: "center",
                        flex: 1
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
                        top: (this.state.loaded) ? 0 : window.height,
                        bottom: 0,
                    }}
                />
            </View>
        );
    }
}

const st = {
    container: {
        flex: 1,
        justifyContent: "center",
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
    }
};