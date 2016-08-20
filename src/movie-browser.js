// Wrapped in enclosure (separates from globals and overall good habit)
(function() {
    // Hard coded values for the purposes of rapid development.
    // In a production environment, these should sit in separate configuration files for production/staging/development servers.
    var app = angular.module('movie-browser', []),
        api_key = '7ab870538b64f3fc26658d523e402ddd',
        collection_id = '528',
        stars_limit = 4,
        api_moviedb_url = 'http://api.themoviedb.org/3/',
        api_config_url = api_moviedb_url + 'configuration?api_key=' + api_key,
        api_collection_url = api_moviedb_url + 'collection/' + collection_id + '?api_key=' + api_key,
        api_movie_url = api_moviedb_url + 'movie/[id]?api_key=' + api_key + '&append_to_response=credits';

    // Main controller for the app. Requests configuration values and collection data from the TMDb API, and handles selection.
    app.controller('DataController', ['$http', '$log', function($http, $log) {
        var dataCtrl = this; // to avoid referencing $http as this during callbacks
        this.config = {};
        this.collection = {};
        this.currentMovie = 0;
        this.currentCast = 0;

        $http.get(api_config_url).then(configSuccessCallback, errorCallback);
        $http.get(api_collection_url).then(collectionSuccessCallback, errorCallback);

        /**
         * Success callback for TMDb API configuration values. Saves to session to cut down on requests.
         * NOTE: Ideal solution would be to save config values from TMDb server-side and refresh once every few days.
         * @param {{data: string|Object, status: number, headers: function, config: Object, statusText: string}} response
         */
        function configSuccessCallback(response) {
            dataCtrl.config = response.data;
        }

        /**
         * Success callback for a movie collection. Appends additional data to each movie in the collection through
         * additional separate ajax requests.
         * @param {{data: string|Object, status: number, headers: function, config: Object, statusText: string}} response
         */
        function collectionSuccessCallback(response) {
            dataCtrl.collection = response.data;
            dataCtrl.collection.parts.forEach(function(element, index, array) {
                $http.get(api_movie_url.replace(/\[id]/g, element.id)).then(function(response) {
                    dataCtrl.collection.parts[index] = response.data; // replace minimal movie data Objects with the full dataset
                }, errorCallback);
            });
        }

        /**
         * Generic error callback for any failed ajax requests.
         * @param {{data: string|Object, status: number, headers: function, config: Object, statusText: string}} response
         */
        function errorCallback(response) {
            $log.log(response);
        }

        /**
         * Set the currently selected movie.
         * @param currentMovie Array index of the currently selected cast movie.
         */
        this.setCurrentMovie = function(currentMovie) {
            dataCtrl.currentMovie = currentMovie;
            dataCtrl.setCurrentCast(0); // reset selected cast member on new movie
        };

        /**
         * Whether or not the given index is attributed to the selected movie.
         * @param index
         * @returns {boolean}
         */
        this.isCurrentMovie = function(index) {
            return dataCtrl.currentMovie === index;
        };

        /**
         * Set the currently selected cast member.
         * @param currentCast Array index of the currently selected cast member.
         */
        this.setCurrentCast = function(currentCast) {
            dataCtrl.currentCast = currentCast;
        };

        /**
         * Whether or not the given index is attributed to the selected cast member.
         * @param index
         * @returns {boolean}
         */
        this.isCurrentCast = function(index) {
            return dataCtrl.currentCast === index;
        };

        /**
         * Assembles a valid URL for an image.
         * @param path An image path in the format '/abcde12345.png'
         * @param imageSize An image size in the format 'w154', 'original', etc.
         * @returns {string}
         */
        this.imageUrl = function(path, imageSize) {
            return this.config.images.base_url + imageSize + path;
        };
    }]);

    /**
     * Filters a movie to the name of the Director.
     */
    app.filter('movieDirectorName', function() {
        return function(movie) {
            if (!movie.credits) { // two-way data binding not set yet
                return '';
            }

            for (var i = 0; i < movie.credits.crew.length; i++) {
                if (movie.credits.crew[i].job.toLocaleLowerCase() == "director") {
                    return movie.credits.crew[i].name;
                }
            }
        };
    });

    /**
     * Filters a movie to a string of names of the Writers.
     */
    app.filter('movieWriterNames', function() {
        return function(movie) {
            var writers = [];
            if (!movie.credits) { // two-way data binding not set yet
                return '';
            }

            for (var i = 0; i < movie.credits.crew.length; i++) {
                if (movie.credits.crew[i].department.toLocaleLowerCase() == "writing") {
                    writers.push(movie.credits.crew[i].name);
                }
            }

            return writers.join(', ');
        };
    });

    /**
     * Filters a movie to a string of the Star cast members. Limited to the top few.
     */
    app.filter('movieStarNames', function() {
        return function(movie) {
            var stars = [];
            if (!movie.credits) { // two-way data binding not set yet
                return '';
            }

            for (var i = 0; i < movie.credits.cast.length && i < stars_limit; i++) {
                stars.push(movie.credits.cast[i].name);
            }

            return stars.join(', ');
        };
    });

    /**
     * An attribute directive to support Angular expressions while assembling an image URL.
     */
    app.directive('backImg', function() {
        return function(scope, element, attrs) {
            var url = attrs.backImg;
            element.css({
                'background-image': 'url(' + url + ')'
            });
        };
    });
})();
