var sportsStoreAdminModule = angular.module("sportsStoreAdmin", ["ngRoute", "ngResource"]);

sportsStoreAdminModule.config(function ($routeProvider) {
  $routeProvider.when("/login", {
    templateUrl: "/templates/adminLogin.jade"
  });
  $routeProvider.when("/main", {
    templateUrl: "/templates/adminMain.jade"
  });
  $routeProvider.otherwise({
    redirectTo: "/login"
  });
});