/**
*
*popup.js
*script created by Andreas Henriksson
*2020-01-31
*
**/


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.searchBtn').addEventListener('click', function(event) {
    chrome.runtime.sendMessage({cmd: "get_rate_from_wiki", link: document.getElementById('urlInput').value}, function(response) {
        //alert(response.result);
        document.getElementById('urlInput').value = response.result;
      }

    );
  });
}, false)
