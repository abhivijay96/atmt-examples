var machina = require('machina')
var replier = require('../Utils/reply')
var Logger = require('../Utils/logger')
var dbUtils = require('../databaseUtils')
var data = require('../data')
var bots = require('../bot')
var impl = require('../rootImpl')
var conversations = require('../conversations')
var authBot = require("./authBot");
var moverBot = require("./moverBot");
var listBot = require("./listBot");
var removeBot = require("./removeBot");
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.stack = [];
        this.maxSize = 5;
        this.name = 'RootMachine';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: function() {

            },
            string: function() {
                replier(this.uuid, 'Hey, Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: function() {
                this.transition("moveState")
            },
            list: function() {
                this.transition("listState")
            },
            remove: function() {
                this.transition("removeState")
            },
            hi: function() {
                this.transition("hiState")
            },
            thanks: function() {
                this.transition("thanksState")
            },
            bye: function() {
                this.transition("byeState")
            },
            '*': function() {
                replier(this.uuid, 'Hey, Sorry I did not understand');
                conversations.done(this.uuid);
            }
            //allTransitions
        },
        moveState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                impl.checkLoginAndMove(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                impl.checkLoginAndMove(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                this.transition("listState")
            },
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                this.transition("removeState")
            },
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                this.transition("hiState")
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                this.transition("thanksState")
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                this.transition("byeState")
            },
            //transitions
        },
        listState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                impl.checkLoginAndList(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                this.transition("moveState")
            },
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                impl.checkLoginAndList(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                this.transition("removeState")
            },
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                this.transition("hiState")
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                this.transition("thanksState")
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                this.transition("byeState")
            },
            //transitions
        },
        removeState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                impl.checkLoginAndRemove(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                this.transition("moveState")
            },
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                this.transition("listState")
            },
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                impl.checkLoginAndRemove(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                this.transition("hiState")
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                this.transition("thanksState")
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                this.transition("byeState")
            },
            //transitions
        },
        hiState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                replier(this.uuid, "Hey, I can create Gmail filters, you can tell me things like\n Move mails about some site to trash. \n move mails about bookmyshow to movies \n move mails from bob@this.com and alice in body to this folder \n Show my rules \n remove rule");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                this.transition("moveState")
            },
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                this.transition("listState")
            },
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                this.transition("removeState")
            },
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                replier(this.uuid, "Hey, I can create Gmail filters, you can tell me things like\n Move mails about some site to trash. \n move mails about bookmyshow to movies \n move mails from bob@this.com and alice in body to this folder \n Show my rules \n remove rule");
                conversations.done(this.uuid);
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                this.transition("thanksState")
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                this.transition("byeState")
            },
            //transitions
        },
        thanksState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                replier(this.uuid, "Always a pleasure to help!");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                this.transition("moveState")
            },
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                this.transition("listState")
            },
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                this.transition("removeState")
            },
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                this.transition("hiState")
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                replier(this.uuid, "Always a pleasure to help!");
                conversations.done(this.uuid);
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                this.transition("byeState")
            },
            //transitions
        },
        byeState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                replier(this.uuid, "Bye, laters!");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                data[this.uuid]["microBots"][rootIntent] = bots[this.uuid];
                if (this.stack.length == this.maxSize) {
                    this.stack.shift();
                }
                this.stack.push(rootIntent);
                this.handle(intent)
            },
            '*': function() {
                let len = this.stack.length - 1;
                let intent = data[this.uuid]['intent'];
                let handled = false;

                for (let i = len; i >= 0; --i) {
                    if (data[this.uuid]['expectedIntents'][this.stack[i]] && data[this.uuid]['expectedIntents'][this.stack[i]].indexOf(intent) >= 0) {
                        handled = true;
                        data[this.uuid]['microBots'][this.stack[i]].handle(data[this.uuid]['intent']);
                    }
                }

                if (!handled) {
                    replier(this.uuid, 'Sorry, I did not quite get that');
                    conversations.done(this.uuid);
                }
            },
            stirng: function() {
                replier(this.uuid, 'Sorry I did not understand');
                conversations.done(this.uuid);
            },
            move: async function() {
                Logger.log(this.uuid, this.name + " got event : move");
                this.transition("moveState")
            },
            list: async function() {
                Logger.log(this.uuid, this.name + " got event : list");
                this.transition("listState")
            },
            remove: async function() {
                Logger.log(this.uuid, this.name + " got event : remove");
                this.transition("removeState")
            },
            hi: async function() {
                Logger.log(this.uuid, this.name + " got event : hi");
                this.transition("hiState")
            },
            thanks: async function() {
                Logger.log(this.uuid, this.name + " got event : thanks");
                this.transition("thanksState")
            },
            bye: async function() {
                Logger.log(this.uuid, this.name + " got event : bye");
                replier(this.uuid, "Bye, laters!");
                conversations.done(this.uuid);
            },
            //transitions
        },
        //states
    }
});