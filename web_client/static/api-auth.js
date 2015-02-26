/**
 * api-auth.js
 *
 * Connect to Endpoints.  Taken from example at
 * `https://cloud.google.com/appengine/docs/python/endpoints/consume_js`.
 */

// TODO: add client id and scopes
var CLIENT_ID = null;
var SCOPES = [];
var API_ROOT = '//' + window.location.host + '/_ah/api';

function apiInit() {
    var apisToLoad;
    var loadCallback = function() {
        if (--apisToLoad == 0) {
            signIn(true, app.refresh);
        }
    };

    apisToLoad = 2; // must match number of calls to gapi.client.load()
    gapi.client.load('dhstutorialsignup', 'v1', loadCallback, API_ROOT);
    gapi.client.load('oauth2', 'v2', loadCallback);
}

function signIn(mode, authorizeCallback) {
    console.log("debug signing in...");
    gapi.auth.authorize({client_id: CLIENT_ID,
                         scope: SCOPES, immediate: mode},
                        authorizeCallback);
}
