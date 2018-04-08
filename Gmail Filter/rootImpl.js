module.exports = {
    checkLoginAndMove: function(uuid, store, replyCallback) {
        if (!store['access_token']) {
            store['next'] = 'mover';
            replyCallback('microbot', 'auth');
        } else
            replyCallback('microbot', 'mover');
    },
    checkLoginAndList: function(uuid, store, replyCallback) {
        if (!store['access_token']) {
            store['next'] = 'list';
            replyCallback('microbot', 'auth');
        } else
            replyCallback('microbot', 'list');
    },
    checkLoginAndRemove: function(uuid, store, replyCallback) {
        if (!store['access_token']) {
            store['next'] = 'remove';
            replyCallback('microbot', 'auth');
        } else
            replyCallback('microbot', 'remove');
    },
    //function
}