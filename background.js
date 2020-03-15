/**
*
*background.js
*script created by Andreas Henriksson
*2020-01-31
*
**/
"use strict";
function onError(error) {
  console.error(`Error: ${error}`);
}

//Tells content to start checking links on webpage
chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tab){
      if (info.status != undefined){
        chrome.tabs.sendMessage(tab[0].id, {action: "do_check_links"}, function(response){

        });
      }
    });
  }
});


//Gets data from Wiki API and returns score
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    var getTitle = function (searchObj) {
      var baseURL = ("https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=");
      baseURL = baseURL + searchObj;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
             if (xmlhttp.status == 200) {
                var jsonData = JSON.parse( xmlhttp.responseText );
                var pageid = jsonData.query.search[1].pageid;
                var entity = getEntity(pageid);
                var score = getScore(entity);
                sendResponse({result: score });
             }
             else if (xmlhttp.status == 400) {
                alert('There was an error 400.');
             }
             else {
                 alert('Error during connect with code: ' + xmlhttp.status);
             }
          }
      };
      xmlhttp.open('GET', baseURL+"&format=json");
      xmlhttp.send();
    }
    
    var getEntity = function (pageid) {
      var baseURL = ("https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&titles=");
      baseURL = baseURL + pageid;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
             if (xmlhttp.status == 200) {
                var jsonData = JSON.parse( xmlhttp.responseText );
                var entity = jsonData.query.pages[0].pageprops.wikibase_item;
                return entity;
             }
             else if (xmlhttp.status == 400) {
                alert('There was an error 400.');
             }
             else {
                 alert('Error during connect with code: ' + xmlhttp.status);
             }
          }
      };
      xmlhttp.open('GET', baseURL+"&format=json");
      xmlhttp.send();
    }

    var getScore = function (entity) {
      var baseURL = ("https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&titles=");
      baseURL = baseURL + entity;
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
             if (xmlhttp.status == 200) {
                var jsonData = JSON.parse( xmlhttp.responseText );
                var score = jsonData.query.pages[0].pageprops.wikibase_item;
                return score;
             }
             else if (xmlhttp.status == 400) {
                alert('There was an error 400.');
             }
             else {
                 alert('Error during connect with code: ' + xmlhttp.status);
             }
          }
      };
      xmlhttp.open('GET', baseURL+"&format=json");
      xmlhttp.send();
    }


review score








    if(request.cmd === "get_rate_from_wiki"){
      getTitle(request.link);
    }
    // Returning true is required here!
    return true;
  }
);
