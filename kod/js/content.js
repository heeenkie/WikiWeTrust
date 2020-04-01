/**
*
*content.js
*script created by Andreas Henriksson
*2020-01-31
*
**/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  document.cookie = 'max-age=7200000;secure;samesite=none'
    if (msg.action === "do_check_links") {
        var links = document.getElementsByTagName("a");
        let urlsMap = new Map();
        for (let index = 0; index < links.length; index++) {
            //Check for not empty strings.
            if (links[index].href != undefined && links[index].href != ""){
                //Check if url contains nature.com.
                if (links[index].href.toLowerCase().indexOf("nature.com") >= 0) {
                    //Check that element has an id otherwise create one.
                    if (links[index].id == undefined || links[index].id == "") {
                        links[index].id = "modiefiedIdFromContentScript-" + index;
                    }
                    urlsMap.set(index, links[index]);
                }
            }
        }

        for (var key of urlsMap.keys()) {
          chrome.runtime.sendMessage({cmd: "get_rate_from_wiki", id: urlsMap.get(key).id, link: "nature"}, function(response) {
              let ele = document.getElementById(response.id);
              ele.outerHTML += ("<span style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-style: normal; color: green;'>(" + response.result + "/3) </span> ");
//ele.innerHTML += (" (" + response.result + "/3)");
              //ele.style.color = "green";
          });
        }
        return true;
    }

});



is_usefull = function(map) {

    let newMap = new Map();
    for (let key of map.keys()) {
        if (((map.get(key)).toLowerCase()).indexOf("nature.com") != -1 ) {
            newMap.set(key, map.get(key));
        }
    }
    return newMap;
}
