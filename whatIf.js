/*eslint-env browser*/
document.querySelector('form').style = "position: relative";
document.querySelector('form').insertAdjacentHTML('afterbegin', "<a id='whatif' class='dhdg_1 vui-heading-2' style='position: absolute; right: 0; font-size: 1.5em;' onclick=whatIf() href='#'>What if?</a>");

var windowUrl = chrome.extension.getURL('window.html');
var xhr = new XMLHttpRequest();
var whatIfWindow;
xhr.open("GET", windowUrl);
xhr.onload = function (e) {
  if (xhr.status == 200) {
    whatIfWindow = xhr.response;
    document.querySelector('.d2l-page-main').insertAdjacentHTML('beforeend', whatIfWindow);
  } else {
    console.log(e)
  }

}
xhr.send();

var script = document.createElement('script');
script.src = chrome.extension.getURL('scripts.js');
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);
