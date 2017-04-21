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
            document.querySelector('#d2l_body').insertAdjacentHTML('beforeend', whatIfWindow);
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

    if (typeof top.location.pathname.split('/')[3] === 'undefined') {
        /* Delete redundant modules if you choose */
        var courses = document.querySelectorAll('[title="Collapse My Courses"]')[1].parentElement.parentElement.parentElement.parentElement;
        courses.parentElement.removeChild(courses)

        var calendar = document.querySelectorAll('[title="Actions for Calendar"]')[0].parentElement.parentElement.parentElement
        calendar.parentElement.removeChild(calendar)
    }

    var upcomingUrl = chrome.extension.getURL('upcoming.html');
    var upcoming;
    xhr = new XMLHttpRequest();
    xhr.open("GET", upcomingUrl);
    xhr.onload = function () {
        if (xhr.status == 200) {
            upcoming = xhr.response;
            document.querySelector('.d2l-homepage .d2l-box:nth-child(1)').insertAdjacentHTML('afterbegin', upcoming);
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
