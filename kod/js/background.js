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
        chrome.tabs.sendMessage(tab[0].id, {action: "do_check_links"});
      }
    });
  }
});


//Gets data from Wiki API and returns score
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    function getEntityFirst(searchObj, callback) {
        let url = ("https://www.wikidata.org/w/api.php?action=query&list=search&format=json&srsearch=" + searchObj);

        fetch(url).then((response) => {
            return response.json();
        }).then((data) => {
            callback(data);
        }).catch((e) => {
            console.log("getEntity: " + e);
        });
    }

    function getScore(entityObj, callback) {
        let entity = entityObj.query.search[0].title;
        let url = ("https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&entity=" + entity);

        fetch(url).then((response) => {
            return response.json();
        }).then((data) => {
            callback(data.claims.P1240);
        }).catch((e) => {
            console.log("getScore: " + e);
        });
    }


    function getMostRecentScore(scores, callback) {
        if (scores == undefined) {
            callback(-1);
        } else if (scores.length == 1) {
            callback(scores[0].mainsnak.datavalue.value);
        } else if (scores.length > 1) {
            scores.sort(function(a, b){
                var dateA = a.qualifiers == undefined? new Date(null): new Date((a.qualifiers.P585[0].datavalue.value.time).substring(1,10) + '1' + (a.qualifiers.P585[0].datavalue.value.time).substring(11));
                var dateB = b.qualifiers == undefined? new Date(null): new Date((b.qualifiers.P585[0].datavalue.value.time).substring(1,10) + '1' + (b.qualifiers.P585[0].datavalue.value.time).substring(11));
                return dateB-dateA
            })
            callback(scores[0].mainsnak.datavalue.value);
        }
    }

    //Calling functions synchronously.
    if (request.cmd === 'get_score') {
        try {
            let arg0 = request.href;
            getEntityFirst(arg0, function(arg1) {
                if ( arg1 == undefined || arg1 == null || arg1.query.searchinfo.totalhits < 1 ) {
                    throw new Error('Could not find entity');
                } else {
                    getScore(arg1, function(arg2) {
                        getMostRecentScore((arg2), function(arg3) {
                            sendResponse({score: arg3});
                        });

                    });
                }
            });
        } catch (e) {
            console.log("getScore: " + e);
            sendResponse({score: -1});
        } finally {
            return true;
        }
    }

});
