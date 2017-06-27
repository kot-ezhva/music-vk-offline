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
            webViewLoaded: false,
            showLoadingBar: false,
            downloadingTracks: 0
        };
    }

    onBridgeMessage(message) {
        if (message === "loaded") {
            this.setState({webViewLoaded: true});
            return;
        }

        this.setState({
            showLoadingBar: true
        });
        let songData = JSON.parse(message);
        let url = songData.url;

        let dirs = RNFetchBlob.fs.dirs;

        let filename = "/" + url.substring(url.lastIndexOf('/') + 1);
        filename = filename.split("?")[0];

        this.setState({downloadingTracks: this.state.downloadingTracks + 1});

        RNFetchBlob
            .config({
                path: dirs.DocumentDir + filename,
            })
            .fetch('GET', url, {
                //some headers ..
            })
            .progress((received, total) => {
                /*this.setState({
                    progressSize: (received / 1024 / 1024).toFixed(2) + "Mb",
                    fullSize: (total / 1024 / 1024).toFixed(2) + "Mb"
                });*/
            })
            .then((res) => {
                let filePath = res.path();

                this.saveAudio({
                    primaryKey: 1,
                    author: songData.author,
                    songName: songData.songName,
                    path: filePath,
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
    /*document.getElementsByClassName("audioPage__search")[0].remove();*/
    document.getElementsByClassName("audioPage__tabs")[0].remove();    

    setInterval(function () {
        addDownloadIcons();
    }, 100);

    function addDownloadIcons() {
        if(document.getElementsByClassName("show_more_wrap").length) {
            document.getElementsByClassName("show_more_wrap")[0].remove();
        }
        
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
                            picture = picture.style.backgroundImage.slice(4, -1);
                            if(~picture.indexOf('"')) {
                                picture = picture.slice(1, -1);
                            }
                        } else {
                            picture = "";
                        }
    
                        var toSend = {
                            url: input.value,
                            author: stripHtml(author),
                            songName: stripHtml(songName),
                            picture: picture
                        };
    
                        WebViewBridge.send(JSON.stringify(toSend));
                    }
                    return false;
                };
            }
        }
    }
    
    function stripHtml(html)
    {
       var tmp = document.createElement("DIV");
       tmp.innerHTML = html;
       return tmp.textContent || tmp.innerText || "";
    }
    
    function findAncestor (el, cls) {
        while ((el = el.parentElement) && !el.classList.contains(cls));
        return el;
    }
}

if(WebViewBridge) {
    WebViewBridge.onMessage = function (message) {
       
    };
    setTimeout(function() {
        WebViewBridge.send("loaded");
    }, 3000);
}
`;
    }

    async saveAudio(file): void {
        try {
            let musicItems = await AsyncStorage.getItem('musicItems');
            let newPrimaryKey = 1;

            if (musicItems !== null && musicItems.length !== 2) {
                musicItems = JSON.parse(musicItems);
                newPrimaryKey = musicItems[musicItems.length - 1].primaryKey + 1;
            } else {
                musicItems = [];
            }
            file.primaryKey = newPrimaryKey;
            musicItems.push(file);

            AsyncStorage.setItem("musicItems", JSON.stringify(musicItems));

            this.setState({
                downloadingTracks: (this.state.downloadingTracks !== 0) ? this.state.downloadingTracks - 1 : 0,
            }, () => {
                this.setState({
                    showLoadingBar: (this.state.downloadingTracks !== 0)
                });
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
                    this.state.webViewLoaded === false
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
                    onError={() => this.setState({webViewLoaded: true})}
                    style={{
                        width: window.width,
                        alignSelf: "stretch",
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: this.state.webViewLoaded ? 0 : window.height,
                        bottom: 0,
                    }}
                />

                {
                    this.state.showLoadingBar
                    &&
                    <View style={st.loadingBarContainer}>
                        <ActivityIndicator
                            animating={true}
                            style={{
                                height: 20,
                                marginRight: 15
                            }}
                            size="large"
                            color="#FFF"
                        />
                        <Text style={st.progressTitle} >
                            Выполняется загрузка ({this.state.downloadingTracks})...
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
    loadingBarContainer: {
        flex: 1,
        flexDirection: "row",
        alignSelf: "stretch",
        position: "absolute",
        height: 50,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#4d7199",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 15
    },
    progressTitle: {
        fontWeight: "100",
        color: "#FFF",
    },
};