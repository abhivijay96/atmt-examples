const conversations = require('./conversations')
const {
    google
} = require('googleapis');
const gmail = google.gmail('v1');
const OAuth2 = google.auth.OAuth2;
const credentials = require('./credentials');

module.exports = {
    checkMoveIntent: function(uuid, store, replyCallback) {
        let from = store['emails']
        let subject = store['subject']
        let body = store['body']
        let replyText = 'Filter requested : ';

        if (from && from.length > 0)
            replyText += '\n From address : ' + from;
        else
            replyText += '\n No from address found in the filter'
        if (subject)
            replyText += '\n subject : ' + subject;
        else
            replyText += '\n no search text for subject found'
        if (body)
            replyText += '\n body : ' + body;
        else
            replyText += '\n no search text found for body'

        replyText += '\n Move to folder : ' + store['folder'];
        replyCallback('text', replyText + '\n Can I go ahead and create this filter or let me know if you like to edit subject or body or from address parts of the filter?');
        conversations.done(uuid);
    },
    addRule: function(uuid, store, replyCallback) {
        const oauth2Client = new OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUrl
        );
        oauth2Client.setCredentials({
            access_token: store['access_token']
        });

        replyCallback('text', 'Contacting Gmail...');

        gmail.users.labels.list({
                userId: 'me',
                auth: oauth2Client
            },
            (err, response) => {
                if (err) {
                    replyCallback('text', 'Could not contact Gmail...');
                } else {
                    let labelFound = false;
                    try {
                        if (response.data.labels.length != 0) {
                            response.data.labels.map((label) => {
                                if (label.name.toLowerCase() == store['folder'].toLowerCase()) {
                                    labelFound = true;
                                    store['folderId'] = label.id;
                                }
                            });
                        }
                        if (!labelFound) {
                            gmail.users.labels.create({
                                    userId: 'me',
                                    auth: oauth2Client,
                                    resource: {
                                        name: store['folder'],
                                        messageListVisibility: 'show',
                                        labelListVisibility: 'labelShow'
                                    }
                                },
                                (lerr, lresponse) => {
                                    if (lerr) {
                                        replyCallback('text', 'I could not create the label');
                                    } else {
                                        store['folderId'] = lresponse.data.id;
                                        this.createRule(store, replyCallback);
                                    }
                                });
                        } else {
                            this.createRule(store, replyCallback);
                        }
                    } catch (error) {
                        console.log(error);
                        replyCallback('text', 'Could not manage label');
                    }
                }
                conversations.done(uuid);
            });
    },
    addFrom: function(uuid, store, replyCallback) {
        store['from'] = store['fromVal'];
        replyCallback('text', 'Changed from address to : ' + store['from'] + ', Shall I create the rule or would you like to edit anything else?');
        conversations.done(uuid);
    },
    addSubject: function(uuid, store, replyCallback) {
        store['subject'] = store['subjectVal'];
        replyCallback('text', 'Changed subject to : ' + store['subject'] + ', Shall I create the rule or would you like to edit anything else?');
        conversations.done(uuid);
    },
    addBody: function(uuid, store, replyCallback) {
        store['body'] = store['bodyVal'];
        replyCallback('text', 'Changed body to : ' + store['body'] + ', Shall I create the rule or would you like to edit anything else?');
        conversations.done(uuid);
    },
    createRule(store, replyCallback) {
        const oauth2Client = new OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUrl
        );
        oauth2Client.setCredentials({
            access_token: store['access_token']
        });
        let c = {}
        if (store['emails'])
            c['from'] = store['emails'];
        if (store['subject'])
            c['subject'] = store['subject'];
        if (store['body'])
            c['query'] = store['body'];

        console.log('criteria is : ', c);

        gmail.users.settings.filters.create({
                userId: 'me',
                auth: oauth2Client,
                resource: {
                    criteria: c,
                    action: {
                        addLabelIds: [store['folderId']]
                    }
                }
            },
            (err, response) => {
                if (err) {
                    console.log(err);
                    replyCallback('text', 'could not create the filter');
                } else {
                    replyCallback('text', 'Created your rule! you can verify it here https://mail.google.com/mail/u/0/#settings/filters. All the mails which come to your inbox from now will be going through this filter, if you want to apply this on existing mails, go to https://mail.google.com/mail/u/0/#settings/filters, click on edit next to the filter, then hit on continue and check the box which says apply to matching mails.');
                }
            });
    }
    //function
}