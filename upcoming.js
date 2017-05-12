/*eslint-env browser*/
var classes;

var ou = top.location.pathname.split('/')[3];
var currDate = new Date();
var startDate = new Date(currDate);
startDate.setDate(startDate.getDate() - 120);
var endDate = new Date(currDate);
endDate.setDate(endDate.getDate() + 120);
var itemsStartDate = new Date(currDate);
itemsStartDate.setDate(itemsStartDate.getDate() - 7);
var daysToShow = 7;
var itemsEndDate = new Date(currDate);
itemsEndDate.setDate(itemsEndDate.getDate() + daysToShow);

if (typeof (ou) != 'undefined') {
  if (ou != "6606") {
    var cclass = [{
      Id: ou
    }];
    document.getElementById('upcoming').classList.add('singleCourse');
    getItems(cclass);
  } else {
    getEnrollments();
  }
} else {
  getEnrollments();
}

function getCourse(courseId, courses) {
  var name = courses.filter(function (course) {
    return course.Id == courseId;
  })[0].Name
  if (typeof (name) == 'undefined') {
    return "";
  } else {
    return "<td><a href=/d2l/home/" + courseId + " title='" + name + "'>" + name + "</a></td>";
  }
}

function getCourseIds(courses) {
  var string = "";
  courses.forEach(function (item) {
    string += item.Id + ",";
  })
  return string;
}

function getGradeById(id){
  var returnString;
  var finalGrade = new XMLHttpRequest();
  finalGrade.open("GET", "/d2l/api/le/1.18/" + id + "/grades/final/values/myGradeValue");
  finalGrade.onload = function() {
    if(finalGrade.status == 200){
      var response = JSON.parse(finalGrade.response);    
      var gradePerc;
      if(response.WeightedDenominator == null){
        gradePerc = Math.round(response.PointsNumerator/response.PointsDenominator * 100)
      } else {
        gradePerc = Math.round(response.WeightedNumerator/response.WeightedDenominator * 100)
      }
      returnString = "" + response.DisplayedGrade + " | " + gradePerc + "%";
      return returnString;
    }
  }
  finalGrade.send();
}

function getItems(classes) {
  var items;
  var itemsxhr = new XMLHttpRequest();
  itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/?completion=3&orgUnitIdsCSV=" + getCourseIds(classes) + "&startDateTime=" + itemsStartDate.toISOString() + "&endDateTime=" + itemsEndDate.toISOString());
  itemsxhr.onload = function () {
    if (itemsxhr.status == 200) {
      items = JSON.parse(itemsxhr.response);
      items.Objects.forEach(function (item) {
        var itemClass = "";
        if (item.DueDate === null) {
          if (item.EndDate === null) {
            item.DueDate = item.StartDate;
            item.IsAvailability = true;
            itemClass = "available"
          } else {
            item.DueDate = item.EndDate;
          }
        }
        if (Date.parse(item.DueDate) - currDate < 0) {
          if (item.IsAvailability) {
            itemClass = "hidden";
          } else {
            itemClass = "late";
          }
        }
        var itemRow = "<tr class=" + itemClass + "><td><a href=" + item.ItemUrl + " title='" + item.ItemName + "'>" + item.ItemName + "</a></td>" + getCourse(item.OrgUnitId, classes) + "<td>" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td></tr>";
        document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
      });
      document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p>*Assignments more that one week overdue are ommited. Quizzes with unlimited attempts will not disappear after completion</p>")
    }
  }
  itemsxhr.send();
}

function isRecent(grade, d2l_grades) {
  var courseId = grade.GradeObjectIdentifier;
  var recent = true, exists = false;
  d2l_grades.forEach(function (gradeObj) {
    if (gradeObj.id == courseId) {
      exists = true;
      if(gradeObj.date - currDate.getTime() > 100*60*60*24){ 
      recent = false;
      }
    }
  });
  if(!exists){
    d2l_grades.push({
      date: currDate.getTime(),
      id: grade.GradeObjectIdentifier
    });    
  }
  return recent;
}

var gradeValues = [];

function evaluateGrades(gradeValues){
  if (typeof (localStorage["d2l_grades"]) === 'undefined') {
    localStorage['d2l_grades'] = "[]";
  }
  var d2l_grades = JSON.parse(localStorage['d2l_grades']);
  var container = document.getElementById('gradesTbody');
  gradeValues.forEach(function(course){
  
    var returnString;
    var finalGrade = new XMLHttpRequest();
    finalGrade.open("GET", "/d2l/api/le/1.18/" + course.Id + "/grades/final/values/myGradeValue", false);
    finalGrade.onload = function() {
      if(finalGrade.status == 200){
        var response = JSON.parse(finalGrade.response);    
        var gradePerc;
        if(response.WeightedDenominator == null){
          gradePerc = Math.round(response.PointsNumerator/response.PointsDenominator * 100)
        } else {
          gradePerc = Math.round(response.WeightedNumerator/response.WeightedDenominator * 100)
        }
        returnString = "" + response.DisplayedGrade + " | " + gradePerc + "%";
        return returnString;
      }
    }
    finalGrade.send();
    
    container.insertAdjacentHTML('beforeend', "<tr><th><a href='/d2l/lms/grades/my_grades/main.d2l?ou=" + course.Id + "'>" + course.name + "</a></th><th>" + returnString + "</th></tr>");
    course.grades.forEach(function (grade) {
      if (isRecent(grade, d2l_grades)) {
        container.insertAdjacentHTML('beforeend', "<tr><td><a href='/d2l/lms/grades/my_grades/main.d2l?ou=" + course.Id + "'>" + grade.GradeObjectName + "</a></td><td>" + grade.DisplayedGrade + " | " + grade.PointsNumerator + "/" + grade.PointsDenominator + "</td></tr>");
      }
    });
  })
  localStorage["d2l_grades"] = JSON.stringify(d2l_grades);
}

function getGrades(courses) {
  courses.forEach(function (course) {
    var grades = new XMLHttpRequest();
    grades.open("GET", "/d2l/api/le/1.15/" + course.Id + "/grades/values/myGradeValues/");
    grades.onload = function () {
      if (grades.status == 200) {
        gradeValues.push({
          name: course.Name,
          Id: course.Id,
          grades: JSON.parse(grades.response).reverse()
        })
        if(gradeValues.length == courses.length){
          evaluateGrades(gradeValues);
        }
      }
    }
    grades.send();
  })
}

function getEnrollments() {
  var classesxhr = new XMLHttpRequest();
  classesxhr.open("GET", "/d2l/api/lp/1.9/enrollments/myenrollments/?canAccess=true&orgUnitTypeId=3&startDateTime=" + startDate.toISOString() + "&endDateTime=" + endDate.toISOString());
  classesxhr.onload = function () {
    if (classesxhr.status == 200) {
      classes = JSON.parse(classesxhr.response);
      var filtered = classes.Items.filter(function (value) {
        return Date.parse(value.Access.EndDate) >= currDate
      });
      filtered = filtered.map(function (value) {
        return {
          Name: value.OrgUnit.Name,
          Id: value.OrgUnit.Id
        }
      });
      getItems(filtered);
      getGrades(filtered);

    }
  }
  classesxhr.send();
}