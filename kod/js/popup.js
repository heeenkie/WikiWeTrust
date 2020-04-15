/**
*
*popup.js
*script created by Andreas Henriksson
*2020-01-31
*
**/


document.addEventListener('DOMContentLoaded', function () {
  function doSearch(){
    var input = document.getElementById("search_input").value;
    chrome.runtime.sendMessage({cmd: "get_rate_from_wiki", id: 1, link: input}, function(response) {

        document.getElementById('result_div').innerHTML = "<p> Score: " + response.result + "</p>";
      }

    );
  }
}, false);
