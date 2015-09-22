
angular.module('nf-auth', ['ngCookies', 'ngRoute'])

.run(function () {
  console.log('Initialize OAuth');
  OAuth.initialize('zwjiwmCkqZA1pefdZF1eEUo7zDI');
})

.factory('nfAuth', function ($rootScope, $route, $cookieStore, $location) {

  function isIE() {
    return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') &&
    (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) !== null)));
  }

  function isIOs() {
    return navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
  }

  function setUser (user) {
    console.log('User', user);
    $rootScope.user = user;
    $route.reload();
  }

  function saveCookie (auth, provider) {
    $cookieStore.put('auth', auth);
    $cookieStore.put('provider', provider);
  }

  function clearCookie () {
    $cookieStore.remove('auth');
    $cookieStore.remove('provider');
  }

  // IE Callback
  OAuth.callback('github', function(err, result) {
    if(err) {
      return console.log(err, result);
    }
    console.log('Callback', arguments);
    saveCookie(result, 'github');

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
        saveCookie(result, 'facebook');

        result.get('/me').done(function (data) {
          setUser(data);
        });
      });
    },

    twLogin: function () {
      OAuth.popup('twitter', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        saveCookie(result, 'twitter');

        result.get('/1.1/account/verify_credentials.json').done(function (data) {
          setUser(data);
        });
      });
    },

    fidLogin: function () {
      OAuth.popup('frontid', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        saveCookie(result, 'frontid');

        result.get('/me').done(function (data) {
          setUser(data);
        });
      });
    },

    ghLogin: function () {
      // Workaround for IE (and iOS)
      if(isIE() || isIOs()) {
        clearCookie();
        OAuth.redirect('github', 'http://' + $location.host() + '/#!/oauth?next=' + encodeURIComponent($location.path()));
        return;
      }

      OAuth.popup('github', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        saveCookie(result, 'github');

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
      var provider = $cookieStore.get('provider');
      if(cookie && provider) {
        console.log('Init Auth', cookie);

        if(provider === 'github') {
          var auth = OAuth.create('github', cookie);
          auth.get('/user')
          .done(function (data) {
            console.log(data);
            setUser(data);
          });
        }
        else if(provider === 'frontid') {
          var auth = OAuth.create('frontid', cookie);
          auth.get('/me')
          .done(function (data) {
            console.log(data);
            setUser(data);
          });
        }
        else if(provider === 'twitter') {
          var auth = OAuth.create('twitter', cookie);
          auth.get('/1.1/account/verify_credentials.json')
          .done(function (data) {
            console.log(data);
            setUser(data);
          });
        }
        else {
          console.log('Unkown provider');
        }
      }
    }
  };
});
