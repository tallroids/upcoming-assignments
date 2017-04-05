/*eslint-env browser*/
/*global chrome*/
var xhr, script;
if (top.location.pathname.split('/')[4] == 'my_grades') {

  document.querySelector('form').style = "position: relative";
  document.querySelector('form').insertAdjacentHTML('afterbegin', "<a id='whatif' class='dhdg_1 vui-heading-2' style='position: absolute; right: 0; font-size: 1.5em;' onclick=whatIf() href='#'>What if?</a>");

  var windowUrl = chrome.extension.getURL('window.html');
  xhr = new XMLHttpRequest();
  var whatIfWindow;
  xhr.open("GET", windowUrl);
  xhr.onload = function () {
    if (xhr.status == 200) {
      whatIfWindow = xhr.response;
      document.querySelector('.d2l-page-main').insertAdjacentHTML('beforeend', whatIfWindow);
    }

  }
  xhr.send();

  script = document.createElement('script');
  script.src = chrome.extension.getURL('scripts.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);

} else if (top.location.pathname.split('/')[2] == 'home') {
  
  var upcomingUrl = chrome.extension.getURL('upcoming.html');
  var upcoming;
  xhr = new XMLHttpRequest();
  xhr.open("GET", upcomingUrl);
  xhr.onload = function () {
    if (xhr.status == 200) {
      upcoming = xhr.response;
      document.querySelectorAll('.d2l-homepage .d2l-box')[0].insertAdjacentHTML('afterbegin', upcoming);
    }

  }
  xhr.send();

  script = document.createElement('script');
  script.src = chrome.extension.getURL('upcoming.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
