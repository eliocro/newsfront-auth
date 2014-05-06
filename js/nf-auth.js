
angular.module('nf-auth', ['ngCookies', 'ngRoute'])

.run(function () {
  console.log('Initialize OAuth');
  OAuth.initialize('cfD4OMAFLU63teGeMOAuxoGdtWg');
})

.factory('nfAuth', function ($rootScope, $route, $cookieStore) {

  function setUser (user) {
    console.log('User', user);
    $rootScope.user = user;
    $route.reload();
  }

  function saveCookie (auth) {
    console.log('Auth', auth);
    $cookieStore.put('auth', auth);
  }

  function clearCookie () {
    $cookieStore.remove('auth');
  }

  return {
    fbLogin: function (count) {
      OAuth.popup('facebook', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        auth = result;
        // saveCookie(auth);

        auth.get('/me').done(function (data) {
          setUser(data);
        });
      });
    },

    ghLogin: function (path) {
      OAuth.popup('github', function(err, result) {
        if(err) {
          return console.log(err, result);
        }
        auth = result;
        saveCookie(auth);

        auth.get('/user').done(function (data) {
          setUser(data);
        });
      });
    },

    logout: function () {
      clearCookie()
      setUser();
    },

    init: function () {
      var cookie = $cookieStore.get('auth');
      if(cookie) {
        console.log('Init Auth', cookie);
        auth = OAuth.create('github', cookie);
        auth.get('/user')
        .done(function (data) {
          console.log(data);
          setUser(data);
        });
      }
    }
  };
});
