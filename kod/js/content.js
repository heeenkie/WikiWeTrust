/**
*
*content.js
*script created by Andreas Henriksson
*2020-01-31
*
**/

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    document.cookie = 'max-age=7200000;Secure;SameSite=None';
    if (msg.action === "do_check_links") {
        var custom_items = new Array();
        var page_items = document.getElementsByTagName("a");


        for (let i = 0; i < page_items.length; i++) {
            let custom_item = new Object();
            //Check for not empty href.
            if (page_items[i].href != undefined && page_items[i].href != ""){
                //Check that element has an id otherwise create one.
                if (page_items[i].id == undefined || page_items[i].id == "") {
                    page_items[i].id = "modiefiedIdFromContentScript-" + i;
                }
                //Trim href to be searchable.
                page_items[i].href_searchable = trimURL(page_items[i].href);
                //Fill new object with nedded attributes and push it to array..
                custom_item.id = page_items[i].id;
                custom_item.href = page_items[i].href
                custom_item.href_searchable = page_items[i].href_searchable;
                custom_items.push(custom_item);
            }
        }


        //Creating a list of unique searchable hrefs.
        var unique_hrefs = Array.from(new Set(custom_items.map(x => x.href_searchable)));

        for (let href of unique_hrefs) {
            //Sending request to api
            chrome.runtime.sendMessage({cmd: "get_rate_from_wiki", href: href}, function(response) {
                //Change every element that contains the searched href.
                for (let custom_item of custom_items) {
                    if (custom_item.href_searchable == href) {
                        changeGUI(custom_item.id, response.result);
                    }
                }
            });
        }


        return true;
    }
});

//Function is changing html code on page.
changeGUI = function(id, score) {
    //Fetch element from page.
    let element = document.getElementById(id);

    //Bad score
    if (score == '1') {
        element.outerHTML += ("<span style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-style: normal; color: darkorange;'>(1/3)</span>");
    }
    //Normal score.
    if (score == '2') {
        element.outerHTML += ("<span style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-style: normal; color: DarkSeaGreen;'>(2/3)</span>");
    }
    //Good score.
    if (score == '3') {
        element.outerHTML += ("<span style='font-size: 14px; font-family: Arial, Helvetica, sans-serif; font-weight: normal; font-style: normal; color: green;'>(3/3)</span>");
    }

}

//Function if trimming the url to a seachable href.
trimURL = function(url) {
    url = url.toLowerCase();

    //Delete everthing in front of domain.
    if (url.indexOf("https://www.") >= 0) {
        url = url.substring(12);
    } else if (url.indexOf("http://www.") >= 0) {
        url = url.substring(11);
    } else if (url.indexOf("https://") >= 0) {
        url = url.substring(8);
    } else if (url.indexOf("http://") >= 0) {
        url = url.substring(7);
    }
    //Delete everything behind domain.
    let posStart = 0;
    let posEnd
    if (url.indexOf(".com") >= 0) {
        posStart = url.indexOf(".com") - 1;
        posEnd = posStart + 5;
    }  else if (url.indexOf(".org") >= 0) {
        posStart = url.indexOf(".org")  - 1;
        posEnd = posStart + 5;
    } else if (url.indexOf(".se") >= 0) {
        posStart = url.indexOf(".se")  - 1;
        posEnd = posStart + 4;
    } else if (url.indexOf(".no") >= 0) {
        posStart = url.indexOf(".no")  - 1;
        posEnd = posStart + 4;
    } else if (url.indexOf(".dk") >= 0) {
        posStart = url.indexOf(".dk")  - 1;
        posEnd = posStart + 4;
    }

    //In case deleting everything in front of domain didnt work correctly.
    let arr = url.split("");
    while (posStart > 0 && arr[posStart-1] != ".") {
        posStart--;
    }

    url = url.substring(posStart, posEnd);
    return url;
}
