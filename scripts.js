/*eslint-env browser*/

function whatIf() {
  if (document.getElementById('grade').innerText == "") {
    document.getElementById('whatIf').style = "";
    getSetup();
  } else {
    document.getElementById('whatIf').style = "";
  }
}

function getSetup() {
  var setup;
  var ou = top.location.search.split('=')[1];
  var setupxhr = new XMLHttpRequest();
  setupxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/setup/");
  setupxhr.onload = function () {
    if (setupxhr.status == 200) {
      setup = JSON.parse(setupxhr.response).GradingSystem;
      getGradeObjs(setup, ou);
    }
  }
  setupxhr.send();
}

var num = 0,
  den = 0;

function getGradeObjs(setup, ou) {
  var grades;
  var gradesxhr = new XMLHttpRequest();
  gradesxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/values/myGradeValues/");
  gradesxhr.onload = function () {
    if (gradesxhr.status == 200) {
      grades = JSON.parse(gradesxhr.response);
      if (setup == "Weighted") {
        weightedOps(grades, ou);
      } else if (setup == "Points") {
        pointsOps(grades, ou);
      }
      document.getElementById('close').insertAdjacentHTML('afterend', '<p>Please note that this calculation should be used for reference only, and the actual final calculated grade may vary slightly</p>')

    }
  }
  gradesxhr.send();
}

function weightedOps(grades, ou) {
  document.getElementById('whatIf').classList.add('weighted');
  var catxhr = new XMLHttpRequest();
  catxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/categories/");
  catxhr.onload = function () {
    if (catxhr.status == 200) {
      var catgs = JSON.parse(catxhr.response);
      catgs.forEach(function (catg) {
        catg.Grades.forEach(function (gradeobj) {
          /* Get the earned value and insert */
          var value;
          gradeobj.gValueObj = grades.filter(function (grade) {
            return grade.GradeObjectIdentifier == gradeobj.Id;
          })[0];
          /* Popluate Table */
          gradeobj.FinalWeight = (gradeobj.Weight) * (catg.Weight / 100);
          if (gradeobj.gValueObj != null) {
            gradeobj.Earned = gradeobj.gValueObj.PointsNumerator;
            value = Math.round(gradeobj.Earned * 100) / 100;
            num += (gradeobj.Earned / gradeobj.MaxPoints) * gradeobj.FinalWeight;
            if (gradeobj.IsBonus === false) {
              den += gradeobj.FinalWeight;
            }
          } else {
            value = "<input class ='newGrade' type='text' onKeyUp='updateGrade()' " + "data-weight='" + gradeobj.FinalWeight + "'>"
          }
          if (gradeobj.IsBonus === false) {
            document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + gradeobj.Name + "</td> <td class='value'>" + value + " / " + gradeobj.MaxPoints + "</td> </tr>");
          } else {
            document.querySelector('#whatIf tbody').insertAdjacentHTML('beforeend', "<tr> <td>" + gradeobj.Name + "</td> <td class='value extra'>" + value + " / " + gradeobj.MaxPoints + "</td> </tr>");
          }
        });
      });
      console.log(catgs);
      localStorage.setItem('num', num);
      localStorage.setItem('den', den);
      document.getElementById('num').innerText = Math.round(num * 100) / 100;
      document.getElementById('den').innerText = Math.round(den * 100) / 100;
      document.getElementById('perc').innerText = Math.round(num / den * 10000) / 100;
      document.getElementById('grade').innerText = getGrade((num / den));
    }
  }
  catxhr.send();
}

function pointsOps(grades, ou) {
  var gradeobjs;
  var gradeobjxhr = new XMLHttpRequest();
  gradeobjxhr.open("GET", "/d2l/api/le/1.15/" + ou + "/grades/");
  gradeobjxhr.onload = function () {
    if (gradeobjxhr.status == 200) {
      gradeobjs = JSON.parse(gradeobjxhr.response);
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
      document.getElementById('num').innerText = Math.round(num * 100) / 100;
      document.getElementById('den').innerText = Math.round(den * 100) / 100;
      document.getElementById('perc').innerText = Math.round(num / den * 10000) / 100;
      document.getElementById('grade').innerText = getGrade((num / den));
    }
  }
  gradeobjxhr.send();
}

function calcWeighted() {
  var num = Number(localStorage.getItem('num'));
  var den = Number(localStorage.getItem('den'));
  document.querySelectorAll('.newGrade').forEach(function (input) {
    if (!input.parentNode.classList.contains('extra') && input.value != "") {
      den += Number(input.getAttribute('data-weight'));
    }
    if (input.value != "") {
      num += (Number(input.value) / Number(input.parentNode.innerText.split('/')[1]) * Number(input.getAttribute('data-weight')));
    }
  });
  document.getElementById('num').innerHTML = Math.round(num * 100) / 100;
  document.getElementById('den').innerHTML = Math.round(den * 100) / 100;
  document.getElementById('perc').innerText = Math.round(num / den * 100);
  document.getElementById('grade').innerText = getGrade((num / den));
}

function updateGrade() {
  if (document.getElementById('whatIf').classList.contains('weighted')) {
    calcWeighted();
  } else {
    var num = Number(localStorage.getItem('num'));
    var den = Number(localStorage.getItem('den'));
    document.querySelectorAll('.newGrade').forEach(function (value) {
      if (!value.parentNode.classList.contains('extra') && value.value != "") {
        den += Number(value.parentNode.innerText.split('/')[1]);
      }
      num += Number(value.value);
    });
    document.getElementById('num').innerHTML = Math.round(num * 100) / 100;
    document.getElementById('den').innerHTML = Math.round(den * 100) / 100;
    document.getElementById('perc').innerText = Math.round(num / den * 10000) / 100;
    document.getElementById('grade').innerText = getGrade((num / den));
  }
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

function closeWhatIf() {
  document.getElementById('whatIf').style = "display:none";
}
