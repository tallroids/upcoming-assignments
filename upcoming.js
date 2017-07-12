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

var daysToShow = 7

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

function sortItems(items) {
  return items.sort(function (a, b) {
    return (new Date(Date.parse(a.DueDate)) - new Date(Date.parse(b.DueDate)))
  })
}

function displayRows(items, classes) {
  items.forEach(function (item) {
    var itemRow = "<tr class='" + item.class + "'><td class='checkCont'><label for='" + item.ItemId + "'><input type='checkbox' id='" + item.ItemId + "' class='checkBoxes' " + item.isHidden + " onchange='updateVisibility(this)'></label></td><td><a href=" + item.ItemUrl + " title='" + item.ItemName + "' target='_blank'>" + item.ItemName + "</a></td>" + getCourse(item.OrgUnitId, classes) + "<td title='" + new Date(Date.parse(item.DueDate)).toLocaleString() + "'>" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td></tr>";
    document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
  })
}

function getItems(classes) {
  if (typeof (localStorage["d2l_assignments"]) === 'undefined') {
    localStorage['d2l_assignments'] = "{}";
  }
  var d2l_assignments = JSON.parse(localStorage['d2l_assignments']);

  var itemsxhr = new XMLHttpRequest();
  itemsxhr.open("GET", "/d2l/api/le/1.18/content/myItems/?completion=3&orgUnitIdsCSV=" + getCourseIds(classes) + "&startDateTime=" + itemsStartDate.toISOString() + "&endDateTime=" + itemsEndDate.toISOString());
  itemsxhr.onload = function () {
    if (itemsxhr.status == 200) {
      var items = JSON.parse(itemsxhr.response).Objects;
      /*Loop through items*/
      items.forEach(function (item) {
        if (typeof (d2l_assignments[item.ItemId]) === "undefined") {
          d2l_assignments[item.ItemId] = {
            id: item.ItemId,
            isHidden: false
          }
        }
        item.class = "visible",
          item.isHidden = "";
        /* Check what type of item it is*/

        if (item.DueDate === null) {
          /* if there is no due date, check if it is an availability */
          if (item.EndDate === null) {
            /* if there is no end date, set it as an availability notice */
            item.DueDate = item.StartDate;
            item.IsAvailability = true;
            item.class = "hidden"
          } else {
            /* if there is no due date, set it as the end date*/
            item.DueDate = item.EndDate;
          }
        }

        /* Check if the item is due today */
        if (Date.parse(item.DueDate) - currDate < 1000 * 60 * 60 * 24) {
          if (!item.IsAvailability) {
            item.class = "urgent";
          }
        }

        /* Check if item is an availability notice and hide it if it has passed */
        if (Date.parse(item.DueDate) - currDate < 0) {
          if (item.IsAvailability) {
            item.class = "oldAvailability";
          } else {
            item.class = "late";
          }
        }

        if (typeof (d2l_assignments[item.ItemId]) != 'undefined') {
          if (d2l_assignments[item.ItemId].isHidden === true) {
            item.class += " hidden";
            item.isHidden = "checked";
          }
        }
        //        var itemRow = "<tr class='" + itemClass + "'><td class='checkCont'><label for='" + item.ItemId + "'><input type='checkbox' id='" + item.ItemId + "' class='checkBoxes' " + isHidden + " onchange='updateVisibility(this)'></label></td><td><a href=" + item.ItemUrl + " title='" + item.ItemName + "' target='_blank'>" + item.ItemName + "</a></td>" + getCourse(item.OrgUnitId, classes) + "<td title='" + new Date(Date.parse(item.DueDate)).toLocaleString() + "'>" + new Date(Date.parse(item.DueDate)).toLocaleString() + "</td></tr>";
        //        document.getElementById('upcomingTbody').insertAdjacentHTML('beforeend', itemRow)
      });
      displayRows(sortItems(items), classes)
      localStorage['d2l_assignments'] = JSON.stringify(d2l_assignments);
      document.getElementById('upcoming').insertAdjacentHTML('beforeend', "<p>*Assignments more than one week overdue are ommited. Quizzes with unlimited attempts will not disappear after completion</p>")
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

function updateVisibility(ele) {
  var assignments = JSON.parse(localStorage.getItem('d2l_assignments'));
  if (!ele.checked) {
    assignments[ele.id].isHidden = ele.checked;
  }
  localStorage['d2l_assignments'] = JSON.stringify(assignments);
}

function hideRows() {
  var assignments = JSON.parse(localStorage.getItem('d2l_assignments'));
  document.querySelectorAll('.checkBoxes').forEach(function (item) {
    if (item.checked) {
      item.parentElement.parentElement.parentElement.classList.add('hidden');
      assignments[item.id].isHidden = true;
    }
  });
  localStorage['d2l_assignments'] = JSON.stringify(assignments);
}

function showRows() {
  document.querySelectorAll('.checkBoxes').forEach(function (item) {
    if (item.checked) {
      item.parentElement.parentElement.parentElement.classList.remove('hidden');
    }
  });
}

if (document.querySelectorAll('.row.no-gutter:not([style])').length < 3) {
  document.querySelector('.d2l-box.d2l-box-h iframe').height = '300px';
  document.querySelector('.d2l-box.d2l-box-h iframe').height = '300px';
  document.querySelector('.d2l-box.d2l-box-h iframe').height = '300px';
}
