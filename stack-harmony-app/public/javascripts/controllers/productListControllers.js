var sportsStoreModule = angular.module("sportsStore");

sportsStoreModule.constant("productListActiveClass", "btn-primary");
sportsStoreModule.constant("productListPageCount", 3);

sportsStoreModule.controller("productListCtrl", function($scope, $filter, productListActiveClass, productListPageCount, cart) {
  var selectedCategory = null;

  $scope.selectedPage = 1;
  $scope.pageSize = productListPageCount;

  //Event bindings update this, which triggers the filter to re-run
  $scope.selectCategory = function(newCategory) {
    selectedCategory = newCategory;
    $scope.selectedPage = 1;
  };

  $scope.selectPage = function(newPage) {
    $scope.selectedPage = newPage;
  };

  //HTML item list directive references this filter
  $scope.categoryFilterFn = function(product) {
    return !selectedCategory || product.category == selectedCategory;
  };

  //ng class directive
  $scope.getCategoryClass = function(category) {
    return selectedCategory == category ? productListActiveClass : "";
  };

  $scope.getPageClass = function(page) {
    return $scope.selectedPage == page ? productListActiveClass : "";
  };

  $scope.addProductToCart = function(product){
    cart.addProduct(product.id, product.name, product.price);
  };
});