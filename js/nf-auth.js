
function isIE() {
  return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') &&
  (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null)));
}

angular.module('nf-auth', ['ngCookies', 'ngRoute'])

.run(function () {
  console.log('Initialize OAuth');
  OAuth.initialize('zwjiwmCkqZA1pefdZF1eEUo7zDI');
})

.factory('nfAuth', function ($rootScope, $route, $cookieStore, $location) {

  function setUser (user) {
    console.log('User', user);
    $rootScope.user = user;
    $route.reload();
  }

  function saveCookie (auth) {
    $cookieStore.put('auth', auth);
  }

  function clearCookie () {
    $cookieStore.remove('auth');
  }

  // IE Callback
  OAuth.callback('github', function(err, result) {
    if(err) {
      return console.log(err, result);
    }
    console.log('Callback', arguments);
    saveCookie(result);
    result.get('/user').done(function (data) {
      setUser(data);
    });
  });


  return {
    fbLogin: function () {
      OAuth.popup('facebook', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        // saveCookie(result);

        result.get('/me').done(function (data) {
          setUser(data);
        });
      });
    },

    ghLogin: function () {
      if(isIE()) {
        clearCookie();
        OAuth.redirect('github', 'http://' + $location.host() + '/oauth?next=' + encodeURIComponent($location.path()));
        return;
      }

      OAuth.popup('github', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        console.log('Popup', result);
        saveCookie(result);

        result.get('/user').done(function (data) {
          setUser(data);
        });
      });
    },

    logout: function () {
      clearCookie();
      setUser();
    },

    init: function () {
      var cookie = $cookieStore.get('auth');
      if(cookie) {
        console.log('Init Auth', cookie);
        var auth = OAuth.create('github', cookie);
        auth.get('/user')
        .done(function (data) {
          console.log(data);
          setUser(data);
        });
      }
    }
  };
});
