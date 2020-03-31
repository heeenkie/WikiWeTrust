/**
*
*content.js
*script created by Andreas Henriksson
*2020-01-31
*
**/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {

    if (msg.action === "do_check_links") {
      var links = document.getElementsByTagName("a");
      let urlsMap = new Map();
      for (let index = 0; index < links.length; index++) {
        if (links[index].href != undefined && links[index].href != ""){
          urlsMap.set(links[index].id, links[index].href);
        }
      }

      var usefull_urls = is_usefull(urlsMap);
      for (var key of usefull_urls.keys()) {
        chrome.runtime.sendMessage({cmd: "get_rate_from_wiki", link: (usefull_urls.get(key)).substring(12,18)}, function(response) {
            alert(response.result);
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
