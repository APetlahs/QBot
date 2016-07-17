'use strict';

var slack = require('@slack/client');

var RTM             = slack.RtmClient;
var CLIENT_EVENTS   = slack.CLIENT_EVENTS;
var RTM_EVENTS      = slack.RTM_EVENTS;

function QBot(settings) {
    this.settings       = settings;
    this.settings.name  = this.settings.name || "qbot";
    this.settings.token = this.settings.token;
    this.user           = null;

    if (! this.settings.token) throw new Error('API token unset!');

    this.rtm = new RTM(this.settings.token, {});
}

QBot.prototype.run = function() {
    var self = this;

    this.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function(start_data) {
        self.on_start(start_data);
    });

    this.rtm.on(RTM_EVENTS.MESSAGE, function(message) {
        self.on_message(message);
    });

    this.rtm.start();
};

QBot.prototype.on_start = function(start_data) {
    this.load_bot(start_data);
};

QBot.prototype.on_message = function(message) {
    if (this.is_from_self(message)) {
        return;
    } else if (this.is_mentioning_bot(message)) {
        this.reply_to_mention(message);
    } else if (this.is_direct_message(message)) {
        this.reply_to_direct_message(message);
    }
};

QBot.prototype.load_bot = function(start_data) {
    var self = this;
    this.user = start_data.users.filter(function(user) {
        return user.name === self.settings.name;
    })[0];
    console.log(this.user);
};

QBot.prototype.is_mentioning_bot = function(message) {
    var self = this;
    if (! message.text) return false;

    var mentions = parse_mentions(message.text);
    mentions = mentions.filter(function(mentioned) {
        return self.user.id === mentioned;
    });

    if (mentions.length > 0) return true;
    return false;
}

QBot.prototype.is_from_self = function(message) {
    return message.bot_id === this.user.profile.bot_id;
}

QBot.prototype.is_direct_message = function(message) {
    if (message.type !== 'message') return false;
    return message.channel.substring(0,1) === 'D';
}

QBot.prototype.reply_to_mention = function(message) {
    console.log('replying to mention!');
    this.rtm.sendMessage("Hey there! You mentioned my name!", message.channel);
}

QBot.prototype.reply_to_direct_message = function(message) {
    console.log('replying to direct message');
    this.rtm.sendMessage("Hey there!", message.channel);
}

function parse_mentions(message_text) {
    var mentions = [];
    var regex = /\<\@([a-zA-Z0-9]+)\>/g
    var match;
    while (match = regex.exec(message_text)) {
        mentions.push(match[1]);
    }
    return mentions;
}

module.exports = QBot;
