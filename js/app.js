
window.angular.module('nftest', ['ngRoute', 'ngSanitize', 'nf-solr', 'nf-auth'])

.config(function ($httpProvider, $routeProvider) {
  $httpProvider.defaults.useXDomain = true;

  $routeProvider
  .when('/', {
    controller: 'IndexCtrl',
    templateUrl: './partials/index.html',
    resolve: {
      routePrefix: function () { return 'artikler/'; }
    }
  })
  .when('/artikler/:name*', {
    controller: 'ArticleCtrl',
    templateUrl: './partials/article.html',
    resolve: {
      routePrefix: function () { return 'artikler/'; }
    }
  });
})

.run(function ($rootScope, nfAuth) {
  $rootScope.user = null;
  nfAuth.init();

  $rootScope.fbLogin = function  () {
    nfAuth.fbLogin();
  };
  $rootScope.ghLogin = function () {
    nfAuth.ghLogin();
  };
  $rootScope.logout = function () {
    nfAuth.logout();
  };
})

.controller('IndexCtrl', function ($scope, nfSolr) {
  // Get Articles
  nfSolr.getArticles(15)
  .then(function (data) {
    // console.log('IndexCtrl', data);
    $scope.articles = data;
  });
})

.controller('ArticleCtrl', function ($scope, $rootScope, $routeParams, nfSolr) {
  var path = 'artikler/' + $routeParams.name;
  // Get Article
  nfSolr.getArticle(path)
  .then(function (data) {
    // console.log('ArticleCtrl', data);
    $scope.article = data;
    if($scope.article.premium && !$rootScope.user) {
      delete $scope.article.content_html;
    }
  });
})
;
