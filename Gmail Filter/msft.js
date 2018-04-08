var builder = require('botbuilder');
var axios = require('axios');
var RootDialog = require('./Machines/RootDialog');
var bots = require('./bot')
var semaphore = require('semaphore')
var data = require('./data')
var restify = require('restify')
var loginEvent = require('./loginEvent')
var urlencoder = require('form-urlencoded')
var semaphores = require('./conversations')
var credentials = require('./credentials')
var dbUtils = require('./databaseUtils')

var server = restify.createServer();
server.use(restify.plugins.queryParser());

setInterval(() => {
    let now = Date.now();
    for(let d in data) {
        if(now - data['last'] > 300000)
            data[d] = undefined
    }
}, 500000);

server.listen(process.env.PORT || process.env.port || 5000, () => {
    console.log('Bot started ---- ');
});

var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});

server.get('/', (req, res) => {
    res.send('Up and running');
})

server.post('/api/messages', connector.listen());

server.get('/oauth', async function(req, res) {
    let params = req.query;
    let query = {
        code: params.code,
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        redirect_uri: credentials.redirectUrl,
        grant_type: 'authorization_code'
    }
    try
    {
        const response = await axios({
            method: 'post',
            url: 'https://www.googleapis.com/oauth2/v4/token',
            data: urlencoder(query),
            headers: {
                'Content-type': 'application/x-www-form-urlencoded'
            }
        });
        let user = params.state;
        data[user].store['access_token'] = response.data.access_token;
        loginEvent.emit('login_' + params.state);
    }
    catch(e) {
        console.log(e);
        loginEvent.emit('logout_' + data.state)
    }
    res.send('You can now close this tab');
});

var bot = new builder.UniversalBot(connector, async function(session) {
    let response = await callDialogFlow(session.message.text, session.message.user.id);
    if (response.data.result.actionIncomplete)
        session.send(response.data.result.fulfillment.speech);
    else
        handleBot(response.data, session);
}).set('storage', new builder.MemoryBotStorage());

bot.on('conversationUpdate', function (message) {
    if (message.membersAdded && message.membersAdded.length > 0)
    {
        var reply = new builder.Message()
        .address(message.address)
        .text('Hey!');
        bot.send(reply);   
    }    
});

async function callDialogFlow(query, sessionId) {
    let clientId = '4e3aa0ef7a6b455c9959dbd29e4e7737'
    const response = await axios.get('https://api.dialogflow.com/v1/query?v=20150910&lang=en&sessionId=' + sessionId + '&query=' + query, {
        'headers': {
            'Authorization': 'Bearer ' + clientId
        }
    });
    return response;
}

function handleBot(dfResponse, session) {
    let uuid = session.message.user.id;

    if (semaphores[uuid] == undefined) {
        semaphores[uuid] = semaphore(1);
    }

    let res = {
        send: function(data) {
            session.send(JSON.parse(data)['speech']);
        }
    }

    res.semaphore = semaphores[uuid];
    res.uuid = uuid;

    if (bots[uuid] == undefined) {
        bots[uuid] = new RootDialog({
            uuid: uuid
        });
        data[uuid] = {
            'store': {},
            'microBots': {},
            'expectedIntents': {}
        }
    }

    data[uuid]['res'] = res;
    data[uuid]['last'] = Date.now();
    let intent = dfResponse.result.metadata.intentName;
    data[uuid]['intent'] = intent;
    data[uuid]['context'] = dfResponse;
    data[uuid]['store']['query'] = dfResponse.result.resolvedQuery;

    if (intent == 'Default Fallback Intent')
        intent = 'string'
    console.log('INTENT: ', intent);
    for (param in data[uuid]["context"].result.parameters) {
        data[uuid]['store'][param] = data[uuid]["context"].result.parameters[param]
    }

    semaphores[uuid].take(function() {
        bots[uuid].handle(intent);
        dbUtils.addValues('conversations', {'who': 'user', 'text': data[uuid]['store']['query'], 'time': Date.now(), 'conversation': uuid});
    });
}