/**
 * api-auth.js
 *
 * Connect to Endpoints.  Taken from example at
 * `https://cloud.google.com/appengine/docs/python/endpoints/consume_js`.
 */

window.CLIENT_ID = '912907751553-lb6mvsskb62dpre0kje7fbvriracme0m.apps.googleusercontent.com';
window.SCOPES = ['https://www.googleapis.com/auth/userinfo.email',
                 'https://www.googleapis.com/auth/plus.me'];
window.API_ROOT = '//' + window.location.host + '/_ah/api';
window.ON_API_LOAD = null;

function apiInit() {
    var apisToLoad;
    var loadCallback = function() {
        if (--apisToLoad == 0) {
            signIn(true, function() {
                window.ON_API_LOAD();
            });
        }
    };

    apisToLoad = 2; // must match number of calls to gapi.client.load()
    gapi.client.load('dhstutorial', 'v1', loadCallback, API_ROOT);
    gapi.client.load('oauth2', 'v2', loadCallback);
}

function signIn(mode, authorizeCallback) {
    gapi.auth.authorize({client_id: window.CLIENT_ID,
                         scope: window.SCOPES,
                         immediate: mode},
                        authorizeCallback);
}
