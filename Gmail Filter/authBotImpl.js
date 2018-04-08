var loginEvent = require('./loginEvent')
const credentials = require('./credentials')
var conversations = require('./conversations')

module.exports = {
    getSignInLink: function(uuid, store, replyCallback) {
        replyCallback('text', 'https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/gmail.settings.basic%20https://www.googleapis.com/auth/gmail.labels&access_type=offline&include_granted_scopes=true&state=' + uuid + '&redirect_uri=' + credentials.redirectUrl + '&response_type=code&client_id=805936737745-5qrtcgvm47m6k9lc0641ar4kfenk9a4c.apps.googleusercontent.com, click on this and sign in so that I can create gmail filters for you');

        const listener = () => {
            replyCallback('microbot', store['next']);
            loginEvent.removeListener('login_' + uuid, listener);
        }

        loginEvent.on('login_' + uuid, listener);

        const logoutListener = () => {
            replyCallback('text', 'I could not connect with your gmail');
            conversations.done(uuid);
            loginEvent.removeListener('logout_' + uuid, logoutListener);
        }
        loginEvent.on('logout_' + uuid, logoutListener);
    },
    //function
}