var machina = require('machina')
var replier = require('../Utils/reply')
var dbUtils = require('../databaseUtils')
var data = require('../data')
var bots = require('../bot')
var Logger = require('../Utils/logger')
var impl = require('../moverBotImpl')
var conversations = require('../conversations')
//require

module.exports = machina.Fsm.extend({

    initialize: function(options) {
        this.uuid = options.uuid;
        this.parent = options.parent;
        this.rootIntent = options.rootIntent;
        this.name = 'moverBot';
    },

    initialState: 'startState',

    states: {
        startState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["yes", "no", "subject", "from", "body"]
                impl.checkMoveIntent(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                impl.checkMoveIntent(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                this.handle(intent);
            },
            yes: function() {
                Logger.log(this.uuid, this.name + " got event : yes in state start");
                this.transition("confirmState");
            },
            no: function() {
                Logger.log(this.uuid, this.name + " got event : no in state start");
                replier(this.uuid, "Hmm ok, tell yes if you change your mind");
                conversations.done(this.uuid);
            },
            subject: function() {
                Logger.log(this.uuid, this.name + " got event : subject in state start");
                this.transition("editSubjectState");
            },
            from: function() {
                Logger.log(this.uuid, this.name + " got event : from in state start");
                this.transition("editFromState");
            },
            body: function() {
                Logger.log(this.uuid, this.name + " got event : body in state start");
                this.transition("editBodyState");
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        confirmState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["string"]
                impl.addRule(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                Logger.log(this.uuid, this.name + " got event : string in state confirm");
                replier(this.uuid, "I have added the filter, how can I help you now");
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
        editFromState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["no", "yes", "subject", "from", "body", "string"]
                impl.addFrom(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                Logger.log(this.uuid, this.name + " got event : string in state editFrom");
                replier(this.uuid, "I have changed your from field");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            no: function() {
                Logger.log(this.uuid, this.name + " got event : no in state editFrom");
                replier(this.uuid, "Hmm ok, you can tell me yes if you change your mind about that.");
                conversations.done(this.uuid);
            },
            yes: function() {
                Logger.log(this.uuid, this.name + " got event : yes in state editFrom");
                this.transition("confirmState");
            },
            subject: function() {
                Logger.log(this.uuid, this.name + " got event : subject in state editFrom");
                this.transition("editSubjectState");
            },
            from: function() {
                Logger.log(this.uuid, this.name + " got event : from in state editFrom");
                this.transition("editFromState");
            },
            body: function() {
                Logger.log(this.uuid, this.name + " got event : body in state editFrom");
                this.transition("editBodyState");
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        editSubjectState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["no", "yes", "subject", "from", "body", "string"]
                impl.addSubject(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                Logger.log(this.uuid, this.name + " got event : string in state editSubject");
                replier(this.uuid, "I have changed the subject part of the filter");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            no: function() {
                Logger.log(this.uuid, this.name + " got event : no in state editSubject");
                replier(this.uuid, "Hmm ok, you can tell me yes if you change your mind about that.");
                conversations.done(this.uuid);
            },
            yes: function() {
                Logger.log(this.uuid, this.name + " got event : yes in state editSubject");
                this.transition("confirmState");
            },
            subject: function() {
                Logger.log(this.uuid, this.name + " got event : subject in state editSubject");
                this.transition("editSubjectState");
            },
            from: function() {
                Logger.log(this.uuid, this.name + " got event : from in state editSubject");
                this.transition("editFromState");
            },
            body: function() {
                Logger.log(this.uuid, this.name + " got event : body in state editSubject");
                this.transition("editBodyState");
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        editBodyState: {
            _onEnter: async function() {
                bots[this.uuid] = this;
                data[this.uuid]["expectedIntents"][this.rootIntent] = ["no", "yes", "subject", "from", "body", "string"]
                impl.addBody(this.uuid, data[this.uuid]['store'], (type, value, async = false) => {
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
                Logger.log(this.uuid, this.name + " got event : string in state editBody");
                replier(this.uuid, "I have changed the body part of the filter");
                conversations.done(this.uuid);
            },
            back: function(intent, rootIntent) {
                this.handle(intent);
            },
            no: function() {
                Logger.log(this.uuid, this.name + " got event : no in state editBody");
                replier(this.uuid, "Hmm ok, you can tell me yes if you change your mind about that.");
                conversations.done(this.uuid);
            },
            yes: function() {
                Logger.log(this.uuid, this.name + " got event : yes in state editBody");
                this.transition("confirmState");
            },
            subject: function() {
                Logger.log(this.uuid, this.name + " got event : subject in state editBody");
                this.transition("editSubjectState");
            },
            from: function() {
                Logger.log(this.uuid, this.name + " got event : from in state editBody");
                this.transition("editFromState");
            },
            body: function() {
                Logger.log(this.uuid, this.name + " got event : body in state editBody");
                this.transition("editBodyState");
            },
            "*": function() {
                Logger.log(this.uuid, this.name + " got event : * ");
                this.parent.handle("back", data[this.uuid]["intent"], this.rootIntent);
            }
        },
        //states
    }
});