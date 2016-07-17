var QBot = require('./lib/qbot');

var API_TOKEN = process.env['QBOT_SLACK_API_TOKEN'];
if (!API_TOKEN) {
    console.error("API Token unset!");
    process.exit(1);
}

var bot = new QBot({
    token : API_TOKEN
});

bot.run();
