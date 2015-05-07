angular.module('ionicApp', ['ionic', 'ngResource'])

.factory('Flickr', function($resource, $q) {
    var photosPublic = $resource('https://api.flickr.com/services/rest', {
        method: "flickr.photos.search",
        api_key: "239125bcc03d4efa36227d1e4eec735a",
        format: "json",
        jsoncallback: 'JSON_CALLBACK'
    }, {
        'load': {
            'method': 'JSONP'
        }
    });

    var viewEXIF = $resource('https://api.flickr.com/services/rest', {
        method: "flickr.photos.getExif",
        api_key: "239125bcc03d4efa36227d1e4eec735a",
        format: "json",
        jsoncallback: 'JSON_CALLBACK'
    }, {
        'load': {
            'method': 'JSONP'
        }
    });

    function search(query) {
        var q = $q.defer();
        photosPublic.load({
            tags: query
        }, function(resp) {
            q.resolve(resp);
        }, function(err) {
            q.reject(err);
        })

        return q.promise;
    }

    function view(id) {

        var EXIFDetails = viewEXIF.load({
            photo_id: id
        });

        return EXIFDetails;
    }
    return {
        search: search,
        view: view
    }
})

.controller('FlickrCtrl', function($scope, Flickr) {
    $scope.photoDetail = false;
    $scope.photoThumbs = true;
    var doSearch = ionic.debounce(function(query) {
        Flickr.search(query).then(function(resp) {

            angular.forEach(resp.photos.photo, function(item) {
                var photosrc = "http://farm" + item.farm + ".staticflickr.com/" + item.server + "/" + item.id + "_" + item.secret + ".jpg";
                item.url = photosrc;
            });
            $scope.photos = resp;
        });
    }, 500);

    $scope.search = function() {
        doSearch($scope.query)
    };

    $scope.showDetail = function(photoID, photoURL) {
        $scope.ExifData = Flickr.view(photoID);
        $scope.ExifData.url = photoURL;
        $scope.photoThumbs = false;
        $scope.photoDetail = true;
    }

    $scope.thumbs = function() {
        $scope.photoThumbs = true;
        $scope.photoDetail = false;
    }

})