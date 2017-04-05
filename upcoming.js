/*eslint-env browser*/
var classes;
var classesxhr = new XMLHttpRequest();
var currDate = new Date();
var startDate = new Date(currDate);
startDate.setDate(startDate.getDate() - 120);
var endDate = new Date(currDate);
endDate.setDate(endDate.getDate() + 120);

var itemsStartDate = new Date(currDate);
itemsStartDate.setDate(itemsStartDate.getDate() - 7);

function getCourse(courseId, courses) {
  return courses.filter(function (course) {
    return course.Id == courseId;
  })[0].Name
}

function getCourseIds(courses) {
  var string = "";
  courses.forEach(function (item) {
    string += item.Id + ",";
  })
  return string;
}

classesxhr.open("GET", "/d2l/api/lp/1.9/enrollments/myenrollments/?isActive=true&canAccess=true&orgUnitTypeId=3&startDateTime=" + startDate.toISOString() + "&endDateTime=" + endDate.toISOString());
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
    var items;
    var itemsxhr = new XMLHttpRequest();
    itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/?completion=3&orgUnitIdsCSV=" + getCourseIds(filtered) + "&startDateTime=" + itemsStartDate.toISOString());
    itemsxhr.onload = function (e) {
      if (itemsxhr.status == 200) {
        items = JSON.parse(itemsxhr.response);
        items.Objects.forEach(function (item) {
          var itemClass = "";
          if (Date.parse(item.DueDate) - currDate < 0) {
            itemClass = "late";
          }
          if (item.DueDate === null) {
            item.DueDate = item.EndDate;
          }
          var itemRow = "<tr><th><a href=" + item.ItemUrl + ">" + item.ItemName + "</a></th><td>" + getCourse(item.OrgUnitId, filtered) + "</td><td class=" + itemClass + ">" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td></tr>";
          document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
        });
        document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p>*Assignments more that one week overdue are ommited. Quizzes with unlimited attempts will not disappear after comletion</p>")
      } else {
        console.error(e);
      }
    }
    itemsxhr.send();

  } else {
    console.error("error")
  }
}
classesxhr.send();

/*/d2l/api/le/(version)/(orgUnitId)/grades/(gradeObjectId)/values/myGradeValue*/
