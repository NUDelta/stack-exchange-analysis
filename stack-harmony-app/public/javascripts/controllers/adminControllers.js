var adminModule = angular.module("sportsStoreAdmin");

adminModule.constant("authUrl", "http://localhost:2403/users/login");
adminModule.constant("ordersUrl", "http://localhost:2403/orders");
adminModule.constant("productUrl", "http://localhost:2403/products/");

adminModule.config(function ($httpProvider) {
  //default settings for all ajax requests
  $httpProvider.defaults.withCredentials = true;
});

adminModule.controller("authCtrl", function ($scope, $http, $location, authUrl) {
  $scope.authenticate = function (user, pass) {
    $http.post(authUrl, {
      username: user,
      password: pass
    }, {
      withCredentials: true  //allows cookies to store coming back
    }).success(function (data) {
      $location.path("/main");
    }).error(function (error) {
      $scope.authenticationError = error;
    });
  };
});

adminModule.controller("mainCtrl", function ($scope) {
  $scope.screens = ["Products", "Orders"];
  $scope.current = $scope.screens[0];

  $scope.setScreen = function (index) {
    $scope.current = $scope.screens[index];
  };

  $scope.getScreen = function () {
    return $scope.current == "Products" ? "/templates/adminProducts.jade" : "/templates/adminOrders.jade";
  };
});

adminModule.controller("ordersCtrl", function ($scope, $http, ordersUrl) {
  var orderPromise = $http.get(ordersUrl, {
    withCredentials: true  //pass along cookies
  });
  orderPromise.success(function (data) {
    $scope.orders = data;
  });
  orderPromise.error(function (error) {
    $scope.error = error;
  });

  $scope.selectedOrder = null;

  $scope.selectOrder = function (order) {
    $scope.selectedOrder = order;
  };

  $scope.calcTotal = function (order) {
    var total = 0;
    for (var i = 0; i < order.products.length; i++) {
      total +=
        order.products[i].count * order.products[i].price;
    }

    return total;
  };
});

adminModule.controller("productCtrl", function ($scope, $resource, productUrl) {

  //query, get, delete, remove, save
  $scope.productsResource = $resource(
      productUrl + ":id",  //define the URI path
    {
      id: "@id"            //define the injected params
    }
  );

  $scope.listProducts = function () {
    $scope.products = $scope.productsResource.query();
  };

  $scope.deleteProduct = function (product) {
    //Remove from server, then UI
    product.$delete().then(function () {
      $scope.products.splice($scope.products.indexOf(product), 1);
    });
  };

  $scope.createProduct = function (product) {
    //save to server, then ui
    new $scope.productsResource(product).$save().then(function (newProduct) {
      $scope.products.push(newProduct);
      $scope.editedProduct = null;
    });
  };

  $scope.updateProduct = function (product) {
    product.$save();
    $scope.editedProduct = null;
  };

  $scope.startEdit = function (product) {
    $scope.editedProduct = product;
  };

  $scope.cancelEdit = function () {
    $scope.editedProduct = null;
  };

  //Kick off fetch
  $scope.listProducts();
});
