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
      if (info.status != undefined && tab != undefined){
        chrome.tabs.sendMessage(tab[0].id, {action: "do_check_links"});
      }
    });
  }
});


//Gets data from Wiki API and returns score
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    function getEntityFirst(searchObj, callback) {

        class SPARQLQueryDispatcher {
        	constructor( endpoint ) {
        		this.endpoint = endpoint;
        	}

        	query( sparqlQuery ) {
        		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
        		const headers = { 'Accept': 'application/sparql-results+json' };

        		return fetch( fullUrl, { headers } ).then( body => body.json() ).catch(err=>console.log(err));
        	}
        }

        const endpointUrl = 'https://query.wikidata.org/sparql';
        const sparqlQuery = `SELECT ?item ?score ?date WHERE {
          ?item wdt:P31 wd:Q5633421;
              wdt:P856 ?href.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
          FILTER(CONTAINS(LCASE("`+ searchObj+`"), LCASE(STR(?href)) ))

          ?item p:P1240 ?scoreItem.
          ?scoreItem ps:P1240 ?score.
          OPTIONAL { ?scoreItem pq:P585 ?date.}
        }`;

        const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
        queryDispatcher.query( sparqlQuery ).then( callback );

    }

    function getEntitySecond(searchObj, callback) {
        class SPARQLQueryDispatcher {
          constructor( endpoint ) {
            this.endpoint = endpoint;
          }

          query( sparqlQuery ) {
            const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
            const headers = { 'Accept': 'application/sparql-results+json' };

            return fetch( fullUrl, { headers } ).then( body => body.json() ).catch(err=>console.log(err));
          }
        }

        const endpointUrl = 'https://query.wikidata.org/sparql';
        const sparqlQuery = `SELECT ?item ?score ?date WHERE {
          ?item wdt:P31 wd:Q5633421;
              wdt:P856 ?href.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
          FILTER(CONTAINS(LCASE(STR(?href)), LCASE("`+ searchObj+`") ))

          ?item p:P1240 ?scoreItem.
          ?scoreItem ps:P1240 ?score.
          OPTIONAL { ?scoreItem pq:P585 ?date.}
        }`;

        const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );
        queryDispatcher.query( sparqlQuery ).then( callback );

    }

    function getMostRecentScore(input, isFirst, callback) {
        let results = input.results.bindings;
        let new_result = new Array();

        if (results.length == 1) {
            callback(results[0].score.value);
            return;
        }

        let unique_arr = Array.from(new Set(results.map(x => x.item.value)));
        let unique_val = unique_arr[0];
        results.forEach((item, i) => {
            if (item.item.value == unique_val) {
                new_result.push(item)
            }
        });

        new_result.sort(function(a, b){

            var dateA = a.date != undefined? new Date(a.date.value): new Date(null), dateB = b.date != undefined? new Date(b.date.value): new Date(null);
            return dateB-dateA
        })

        try {
            callback(new_result[0].score.value);
        } catch (e) {
          console.log("getMostRecentScore: " + e);
            callback(-1);
        }
    }

    //Calling functions synchronously.
    if (request.cmd === 'get_score_first_try') {
        let arg0 = request.href;
        getEntityFirst(arg0, function(arg1) {
            if ( arg1 != undefined && arg1 != null && arg1.results.bindings.length > 0) {
                getMostRecentScore(arg1, true, function(arg2) {
                    sendResponse({score: arg2, id: request.id});
                });
            } else {
                sendResponse({score: -2, id: request.id});
            }
        });
        return true;
    }
    if (request.cmd === 'get_score_second_try') {
        let arg0 = request.href;
        getEntitySecond(arg0, function(arg1) {
            if ( arg1 != undefined && arg1 != null && arg1.results.bindings.length > 0) {
                getMostRecentScore(arg1, false, function(arg2) {
                    sendResponse({score: arg2});
                });
            } else {
                sendResponse({score: -2});
            }
        });
        return true;
    }
});
