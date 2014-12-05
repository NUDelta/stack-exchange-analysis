var model = {
};

var tagArr = [];

var todoApp = angular.module("todoApp", []);

var parseChecked = function (items) {
  var selectedTagSets = _(items).filter(function (item) {
    return item.checked;
  });

  selectedTagSets = _(selectedTagSets).pluck('tags');

  selectedTagSets = _(selectedTagSets).flatten();

  var uniq = _(selectedTagSets).unique();

  var resultArr = [];
  _(uniq).each(function (tag) {
    var dups = _(selectedTagSets).reduce(function (memo, tagR) {
      if (tag == tagR) {
        memo.push(tagR);
      }
      return memo;
    }, []);

    resultArr.push(tag + "|" + dups.length);
  });

  resultArr = _(resultArr).sortBy(function(result){
    return result.split("|")[1] * -1;
  });

  return resultArr;
};

todoApp.run(function ($http) {
  $http.get("tasks").success(function (data) {
    model.items = data.items;
    model.has_more = data.has_more;
  });
});

todoApp.filter('trustHTMLFilter', function ($sce) {
  return function (val) {
    return $sce.trustAsHtml(val);
  };
});

todoApp.controller("ToDoCtrl", function ($scope, $http) {
  $scope.todo = model;
  $scope.tagArr = tagArr;

  $scope.viewLearner = true;
  $scope.viewFinder = false;

  var fetchQuestions = function () {
    var tags = "";

    if ($scope.tagArr.length > 0) {
      tags = "?tagged=" + $scope.tagArr.join(";");
    }

    $http.get("tasks" + tags).success(function (data) {
      $scope.todo.items = data.items;
    });
  };

  $scope.addTag = function (tagText) {
    if ($scope.tagArr.length < 4) {
      $scope.tagArr.push(tagText);
      fetchQuestions();
    }
  };

  $scope.removeTag = function (tagText) {
    $scope.tagArr = _(tagArr).without(tagText);
    fetchQuestions();
  };

  $scope.changeViewFinder = function (){
    $scope.openQuestions = [];

    $scope.viewLearner = false;
    $scope.viewFinder = true;

    var tagArr = parseChecked($scope.todo.items);
    var tags = [];

    if (tagArr.length > 0) {
      tagArr = _(tagArr).map(function(tag){return tag.split("|")[0];});
      tagArr = _(tagArr).first(3);
      tags = "?tagged=" + tagArr.join(";");
    }
    $http.get("unanswered" + tags).success(function (data) {
      $scope.todo.openQuestions = data.items;
    });
  };

  $scope.changeViewLearner = function (){
    $scope.viewLearner = true;
    $scope.viewFinder = false;
  };
});

todoApp.filter("checkedTagsFilter", function () {
  return function (items) {
    return parseChecked(items);
  };

});