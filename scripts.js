/*eslint-env browser*/
function whatIf() {
  var ou = top.location.search.split('=')[1];
  var grades, gradeobjs;
  document.getElementById('whatIf').style = "";

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
              document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + obj.Name + "</td> <td class='value'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
            } else {
              document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + obj.Name + "</td> <td class='value extra'>" + value + " / " + obj.MaxPoints + "</td> </tr>");
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
