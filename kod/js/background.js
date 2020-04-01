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
    function getPageId(searchObj, callback) {
        let url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + searchObj;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    let jsonData = JSON.parse( xmlhttp.responseText );
                    let pageid = jsonData.query.search[1].pageid;
                    callback(pageid);

                }
                else if (xmlhttp.status == 400) {
                    alert('There was an error 400.');
                }
                else {
                    alert('Error during connect with code: ' + xmlhttp.status);
                }
            }
        };
        xmlhttp.open('GET', url+'&format=json', true);
        xmlhttp.send();
    }

    function getEntity(pageid, callback) {
        let url = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=wikibase_item&pageids=' + pageid;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    let jsonData = JSON.parse(xmlhttp.responseText);
                    let entity = jsonData.query.pages[pageid].pageprops.wikibase_item;
                    callback(entity);
                }
                else if (xmlhttp.status == 400) {
                    alert('There was an error 400.');
                }
                else {
                    alert('Error during connect with code: ' + xmlhttp.status);
                }
            }
        };
        xmlhttp.open('GET', url+'&format=json', true);
        xmlhttp.send();
    }

    function getScore(entity, callback) {
      let url = 'https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=' + entity;
        let xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    let jsonData = JSON.parse( xmlhttp.responseText );
                    let propertiesP1240 = jsonData.claims.P1240;

                    let score = getRightScore(propertiesP1240);

                    sendResponse({result: score, id: request.id});
                    for (var propertyP1240 of propertiesP1240) {
                        if (propertyP1240.mainsnak.datavalue != undefined && propertyP1240.mainsnak.datavalue.type == "string") {

                        }
                    }

                    //callback(score);
                }
                else if (xmlhttp.status == 400) {
                    alert('There was an error 400.');
                }
                else {
                    alert('Error during connect with code: ' + xmlhttp.status);
                }
            }
        };
        xmlhttp.open('GET', url+'&format=json', true);
        xmlhttp.send();
    }

    function getRightScore(props) {
        let scoreAndTimeMap = new Map();
        for (var prop of props) {
            if (prop.qualifiers != undefined) {
                let str = prop.qualifiers.P585[0].datavalue.value.time;
                str = str.substring(1);
                let arr = str.split("");
                arr[9] = "1";
                str = arr.join('');
                scoreAndTimeMap.set(prop.mainsnak.datavalue.value, new Date(str));
            }else {
                scoreAndTimeMap.set(prop.mainsnak.datavalue.value, new Date(0,0,0,0,0,0,0));
            }
        }


        scoreAndTimeMap = new Map(
            Array
            .from(scoreAndTimeMap)
            .sort((a, b) => {
            // a[0], b[0] is the key of the map
                return b[1] - a[1];
            })
        )

        return scoreAndTimeMap.keys().next().value;
    }

    //Calling functions synchronously.
    if (request.cmd === 'get_rate_from_wiki') {
        getPageId(request.link, function(arg1) {
            getEntity(arg1, function(arg2) {
                getScore(arg2);

            })
        })
        return true;
    }
    // Returning true is required here!

});