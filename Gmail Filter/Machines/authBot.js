var machina = require('machina')
var replier = require('../Utils/reply')
var dbUtils = require('../databaseUtils')
var data = require('../data')
var bots = require('../bot')
var Logger = require('../Utils/logger')
var impl = require('../authBotImpl')
var conversations = require('../conversations')
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.parent = options.parent;
        this.rootIntent = options.rootIntent;
        this.name = 'authBot';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["string"]
                impl.getSignInLink(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
                    if (type == 'text') {
                        replier(this.uuid, value, async);
                    } else if (type == 'microbot') {
                        var mb = require('./' + value + 'Bot');
                        bots[this.uuid] = new mb({
                            uuid: this.uuid,
                            parent: this
                        });
                    } else if (type == 'transition') {
                        this.transition(value != 'string' ? value + 'State' : value);
                    }
                });
            },
            string: async function() {
                Logger.log(this.uuid, this.name + " got event : string in state start");
                replier(this.uuid, "Please sign in with the link previously provided");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        //states
    }
});