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

function getItems(classes) {
  var items;
  var itemsxhr = new XMLHttpRequest();
  itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/?completion=3&orgUnitIdsCSV=" + getCourseIds(classes) + "&startDateTime=" + itemsStartDate.toISOString());
  itemsxhr.onload = function () {
    if (itemsxhr.status == 200) {
      items = JSON.parse(itemsxhr.response);
      items.Objects.forEach(function (item) {
        var itemClass = "";
        if (item.DueDate === null) {
          item.DueDate = item.EndDate;
        }
        if (Date.parse(item.DueDate) - currDate < 0) {
          itemClass = "late";
        }
        var itemRow = "<tr><th><a href=" + item.ItemUrl + " title='" + item.ItemName + "'>" + item.ItemName + "</a></th>" + getCourse(item.OrgUnitId, classes) + "<td class=" + itemClass + ">" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td></tr>";
        document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
      });
      document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p>*Assignments more that one week overdue are ommited. Quizzes with unlimited attempts will not disappear after completion</p>")
    }
  }
  itemsxhr.send();
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

    }
  }
  classesxhr.send();
}
