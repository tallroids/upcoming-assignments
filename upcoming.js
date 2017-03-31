/*eslint-env browser*/
var classes;
var classesxhr = new XMLHttpRequest();
var currDate = new Date();
var startDate = new Date(currDate);
startDate.setDate(startDate.getDate() - 120);
var endDate = new Date(currDate);
endDate.setDate(endDate.getDate() + 120);

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
    console.log(filtered);
    var items;
    var itemsxhr = new XMLHttpRequest();
    itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/due/?COMPLETION_T=1&orgUnitIdsCSV=" + getCourseIds(filtered));
    itemsxhr.onload = function (e) {
      if (itemsxhr.status == 200) {
        items = JSON.parse(itemsxhr.response);
        console.log(items)
        items.Objects.forEach(function (item) {
          var itemRow = "<th><a href=" + item.ItemUrl + ">" + item.ItemName + "</a></th><td class='name'>" + getCourse(item.OrgUnitId, filtered) + "</td><td>" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td>";
          document.getElementById('upcomingTable').insertAdjacentHTML('afterbegin', itemRow)
        });
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
