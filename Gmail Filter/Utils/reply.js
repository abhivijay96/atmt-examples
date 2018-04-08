var data = require('../data')
var dbUtils = require('../databaseUtils')

module.exports = function(uuid, text){
    data[uuid]['res'].send(JSON.stringify({"speech": text, "displayText": text}))
    dbUtils.addValues('conversations', {'who': 'bot', 'text': text, 'time': Date.now(), 'conversation': uuid});
}