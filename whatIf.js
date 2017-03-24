/*eslint-env browser*/
if (window.location.pathname.split('/')[4] == "my_grades") {
  document.querySelector('form').style = "position: relative";
  document.querySelector('form').insertAdjacentHTML('afterbegin', "<a id='whatif' class='dhdg_1 vui-heading-2' style='position: absolute; right: 0; font-size: 1.5em;' onclick=whatIf() href='#'>What if?</a>");
}

var script = document.createElement('script');
script.src = chrome.extension.getURL('scripts.js');
script.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

function whatIf() {
  var ou = top.location.search.split('=')[1];
  var grades, gradeobjs;
  document.querySelector('.d2l-page-main').insertAdjacentHTML('beforeend', "<div id='whatIf'> <style> #whatIf { box-shadow: black 0 0 10px; background: #fff; position: fixed; top: 30px; width: 600px; max-height: 600px; height: 600px; border-radius: 4px; padding: 20px; overflow-y: auto; transform: translate(-50%); left: 50%; top: 60px; } #whatIf table {width: 100%} #whatIf td, #whatIf th {padding: 3px 10px; font-size: 1.3em;} #whatIf table tr { border: solid #aaa; border-width: 1px 0px 1px; width: 100%; } #whatIf .value { text-align: right; position: relative; right: 14%; } #whatIf input {      width: 40px; border: solid #888 1px; border-radius: 2px; } #whatIf tr:nth-child(even) { background: #f1f5f9; } #whatIf th { background: #def; } #whatIf h1 { margin: 0 0 10px 0; font-size:1.5em; color: #333; } .extra{color: #5c893a;} #close{position: absolute; top: 1em; right: 1em } #whatIf input {text-align: right}</style>  <h1>What If?</h1> <table> <tr> <th>Grade Item</th> <th>Grade</th> </tr> <tr id='total'> <th>Total</th> <th><span id='num' ></span>/<span id='den'></span> | <span id='perc'></span>% | <span id='grade'></span></th> </tr> </table> <a href='#' onclick='closeWhatIf()' id='close'>✕</a> </div>");

  var gradeobjxhr = new XMLHttpRequest();
  gradeobjxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/");
  gradeobjxhr.onload = function () {
    if (gradeobjxhr.status == 200) {
      gradeobjs = JSON.parse(gradeobjxhr.response);

      var gradesxhr = new XMLHttpRequest();
      gradesxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/values/myGradeValues/");
      gradesxhr.onload = function () {
        if (gradesxhr.status == 200) {
          grades = JSON.parse(gradesxhr.response);
          var num = 0,
            den = 0;
          gradeobjs.forEach(function (obj) {
            var value;
            value = grades.filter(function (grade) {
              return grade.GradeObjectIdentifier == obj.Id
            })[0];
            if (value != null) {
              num += value.PointsNumerator;
              if (obj.IsBonus === false) {
                den += value.PointsDenominator;
              }
              value = value.PointsNumerator;
            } else {
              value = "<input class ='newGrade' type='text' onKeyUp='updateGrade()'>"
            }
            if (obj.IsBonus === false) {
              document.querySelector('#total').insertAdjacentHTML('beforebegin', "<tr> <td>" + obj.Name + "</td> <td class='value'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
            } else {
              document.querySelector('#total').insertAdjacentHTML('beforebegin', "<tr> <td>" + obj.Name + "</td> <td class='value extra'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
            }
          })
          localStorage.setItem('num', num);
          localStorage.setItem('den', den);
          document.getElementById('num').innerText = num;
          document.getElementById('den').innerText = den;
          document.getElementById('perc').innerText = Math.round(num / den * 100);
          document.getElementById('grade').innerText = getGrade((num / den));
        }
      }
      gradesxhr.send();
    }
  }
  gradeobjxhr.send();
}

function closeWhatIf() {
  document.getElementById('whatIf').parentNode.removeChild(document.getElementById('whatIf'))
}

function updateGrade() {
  var num = Number(localStorage.getItem('num'));
  var den = Number(localStorage.getItem('den'));
  document.querySelectorAll('.newGrade').forEach(function (value) {
    if (!value.parentNode.classList.contains('extra') && value.value != "") {
      den += Number(value.parentNode.innerText.split('/')[1]);
    }
    num += Number(value.value);
  });
  document.querySelector('#num').innerHTML = num;
  document.querySelector('#den').innerHTML = den;
  document.getElementById('perc').innerText = Math.round(num / den * 100);
  document.getElementById('grade').innerText = getGrade((num / den));
}

function getGrade(perc) {
  if (perc >= .93) {
    return "A";
  } else if (perc >= .90) {
    return "A-";
  } else if (perc >= .87) {
    return "B+";
  } else if (perc >= .83) {
    return "B";
  } else if (perc >= .80) {
    return "B-";
  } else if (perc >= .77) {
    return "C+";
  } else if (perc >= .73) {
    return "C";
  } else if (perc >= .70) {
    return "C-";
  } else if (perc >= .67) {
    return "D+";
  } else if (perc >= .63) {
    return "D";
  } else if (perc >= .60) {
    return "D-";
  } else return "F"
}
