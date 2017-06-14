/*eslint-env browser*/
/*global chrome*/
var script;


/* Add Upcoming Assignments Widget */
var upXhr = new XMLHttpRequest();
upXhr.open("GET", chrome.extension.getURL('upcoming.html'));
upXhr.onload = function () {
  if (upXhr.status == 200) {
    var upcoming = upXhr.response;
    document.querySelector('.d2l-homepage .d2l-box:nth-child(1)').insertAdjacentHTML('afterbegin', upcoming);
  }
}
upXhr.send();

/*Insert Script*/
script = document.createElement('script');
script.src = chrome.extension.getURL('upcoming.js');
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);
