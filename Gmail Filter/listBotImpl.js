const {
    google
} = require('googleapis');
const gmail = google.gmail('v1');
const OAuth2 = google.auth.OAuth2;
const credentials = require('./credentials');
const conversations = require('./conversations');

module.exports = {
    listRules: function(uuid, store, replyCallback) {
        const oauth2Client = new OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUrl
        );
        oauth2Client.setCredentials({
            access_token: store['access_token']
        });

        replyCallback('text', 'Contacting Gmail...');

        gmail.users.settings.filters.list({
                userId: 'me',
                auth: oauth2Client
            },
            (err, response) => {
                if (err) {
                    console.log(err);
                    replyCallback('text', 'I was not able to get data from gmail');
                } else {
                    if (response.data['filter'].length == 0) {
                        replyCallback('text', 'looks like you do not have any filters');
                    } else {
                        store['filterIds'] = []
                        replyCallback('text', this.formatReply(response.data['filter']));
                        response.data['filter'].map((filter) => {
                            store['filterIds'].push(filter.id);
                        });
                        console.log(JSON.stringify(store['filterIds'], null, '\t'))
                    }
                }
                conversations.done(uuid);
            }
        )
    },
    formatReply: function(filters) {
        let reply = ''
        let i = 1;
        filters.map((filter) => {
            let formattedText = i++ + '. ' + 'Filter which matches\n';
            for (let c in filter.criteria) {
                formattedText += (c + ': ' + filter.criteria[c] + '\n')
            }
            reply += formattedText;
        });
        return reply;
    }
    //function
}