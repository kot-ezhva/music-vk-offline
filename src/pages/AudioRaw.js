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
                btn.style.backgroundPositionY = "-70px";
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
    }
}