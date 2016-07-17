'use strict';

var SlackBot = require('slackbots');
var API_TOKEN = process.env['QBOT_SLACK_API_TOKEN'];

function QBot(settings) {
    this.settings = settings;
    this.settings.name  = this.settings.name || "qbot";
    this.settings.token = this.settings.token || API_TOKEN;
    this.user = null;
    this.slackbot = null;
}

QBot.prototype.run = function() {
    var self = this;
    this.slackbot = new SlackBot(this.settings);

    this.slackbot.on('start', function() {
        self.on_start();
    });

    this.slackbot.on('message', function(message) {
        self.on_message(message);
    });
};

QBot.prototype.on_start = function() {
    this.load_bot();
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

QBot.prototype.load_bot = function() {
    var self = this;
    this.user = this.slackbot.users.filter(function(user) {
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
    this.slackbot.postMessage(message.channel, "Hey there! You mentioned my name!");
}

QBot.prototype.reply_to_direct_message = function(message) {
    console.log('replying to direct message');
    this.slackbot.postMessage(message.channel, "Hey There!");
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
