if (window.location.pathname.split('/')[4] == "my_grades") {
  var values = Array.prototype.slice.call(document.querySelectorAll("label")).filter(function (value) {
    return value.id !== "" && value.innerText.includes('/');
  });
  document.querySelector('.d2l-page-main').insertAdjacentHTML('beforeend', "<a id='whatif' style='position: absolute; bottom: 10px; right: 48%; font-size: 2em; background: #326ba9; border-radius: 5px; padding: 10px; color: white' onclick=makeBoxes() href='#'>What if?</a>");
}

function makeBoxes() {
  if (document.getElementById('finalGrade') === null) {
    document.querySelector('form table').insertAdjacentHTML('afterend', "<h2 class='vui-heading-2' style='text-align:right'>Final Grade: <span id='finalGrade' style='font-weight: 600'></span></h2>");
    values.forEach(function (value) {
      if (value.innerText.includes('-')) {
        value.insertAdjacentHTML('afterbegin', '<input id="' + value.id + 'box" type="text" style="width:30px; margin-right: 10px; border: solid 1px #999; border-radius:3px; text-align:right; padding: 2px; position: absolute; right: 35px; top: -4px" onKeyUp="updateGrade()">');
      }
      value.style = "position: relative; height: 20px";
    });
    updateGrade();
  }
}

function updateGrade() {
  var den = 0;
  var num = 0;
  values.forEach(function (value) {
    var split = value.innerText.split('/');
    if (split[0] == ("- ")) {
      if (document.getElementById(value.id + 'box').value !== '') {
        num += Number(document.getElementById(value.id + 'box').value);
        den += Number(split[1]);
      }
    } else {
      num += Number(split[0]);
      den += Number(split[1]);
    }
    var grade;
    if (num / den >= .93) {
      grade = "A";
    } else if (num / den >= .90) {
      grade = "A-";
    } else if (num / den >= .87) {
      grade = "B+";
    } else if (num / den >= .83) {
      grade = "B";
    } else if (num / den >= .80) {
      grade = "B-";
    } else if (num / den >= .77) {
      grade = "C+";
    } else if (num / den >= .73) {
      grade = "C";
    } else if (num / den >= .70) {
      grade = "C-";
    } else if (num / den >= .67) {
      grade = "D+";
    } else if (num / den >= .63) {
      grade = "D";
    } else if (num / den >= .60) {
      grade = "D-";
    } else grade = "F"
    document.getElementById('finalGrade').innerText = num + "/" + den + " | " + Math.round(num / den * 100) + "% " + "(" + grade + ")"
  });
}
