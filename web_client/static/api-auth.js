/**
 * api-auth.js
 *
 * Connect to Endpoints.  Taken from example at
 * `https://cloud.google.com/appengine/docs/python/endpoints/consume_js`.
 */

// TODO: add client id and scopes
window.CLIENT_ID = '185595448807-h36t655f1phh27l4jp9pfkmu4legbkro.apps.googleusercontent.com';
window.SCOPES = ['https://www.googleapis.com/auth/userinfo.email'];
window.API_ROOT = '//' + window.location.host + '/_ah/api';
window.apiSignedIn = false;

function apiInit() {
    var apisToLoad;
    var loadCallback = function() {
        if (--apisToLoad == 0) {
            signIn(true, function() {
                window.apiSignedIn = true;
                app.refresh();
            });
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
