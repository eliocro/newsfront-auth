
angular.module('nf-solr', ['solstice'])

.config(function (SolsticeProvider) {
  SolsticeProvider.setEndpoint('http://index.websolr.com/solr/1e6f37c54b7');
})

.factory('nfSolr', function (Solstice, $q) {
  return {
    getArticles: function (count) {
      var d = $q.defer();
      var options = {
        rows: count || 10,
        q: 'bundle:article',
        sort: 'created desc'
      };
      Solstice.search(options)
      .then(function (data) {
        var list = data.data.response.docs;
        for (var i = 0, l = list.length; i<l; i++) {
          list[i].premium = (list[i].authors[0] !== 'perandre');
        }
        d.resolve(list);
      },
      function (err) {
        d.reject(err);
      });
      return d.promise;
    },

    getArticle: function (path) {
      var d = $q.defer();
      var options = {
        rows: 1,
        q: 'bundle:article AND path_alias:' + path,
        sort: 'created desc'
      };
      Solstice.search(options)
      .then(function (data) {
        var art = data.data.response.docs[0];
        art.premium = (art.authors[0] !== 'perandre');
        d.resolve(art);
      },
      function (err) {
        d.reject(err);
      });
      return d.promise;
    }
  };
});
