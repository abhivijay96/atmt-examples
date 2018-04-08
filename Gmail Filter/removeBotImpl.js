const conversations = require('./conversations');
const {
    google
} = require('googleapis');
const gmail = google.gmail('v1');
const OAuth2 = google.auth.OAuth2;
const credentials = require('./credentials');

module.exports = {
    showRulesList: function(uuid, store, replyCallback) {
        replyCallback('text', 'Which one of these should I remove? Tell me it\'s index');
        replyCallback('microbot', 'list');
    },
    removeRuleAt: function(uuid, store, replyCallback) {
        let number = parseInt(store['value']);
        if (number < 1 || number > store['filterIds'].length) {
            replyCallback('text', 'Your choice is not valid');
        } else {
            const oauth2Client = new OAuth2(
                credentials.clientId,
                credentials.clientSecret,
                credentials.redirectUrl
            );
            oauth2Client.setCredentials({
                access_token: store['access_token']
            });
            gmail.users.settings.filters.delete({
                userId: 'me',
                auth: oauth2Client,
                id: store['filterIds'][number - 1]
            }, (err, response) => {
                if (err) {
                    console.log(err);
                    replyCallback('text', 'Could not delete the rule');
                    conversations.done(uuid);
                } else {
                    replyCallback('transition', 'removed');
                }
            });
        }
    },
    //function
}