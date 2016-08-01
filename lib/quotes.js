var yahoo = require('yahoo-finance');

require('datejs');

exports.get_quotes = function(symbols, callback) {
    if (typeof symbols === 'string') {
        symbols = [symbols];
    }

    yahoo.snapshot({ symbols : symbols}, callback);
}

exports.get_formatted_quotes = function(symbols, callback) {
    return exports.get_quotes(symbols, function(err, results) {
        console.log(results);
        if (err) return callback(err);
        return callback(null, format_quotes(results));
    });
}

function format_quotes(quotes) {
    var formatted_quotes = [];

    quotes.forEach(function(q) {

        var color = q.changeInPercent > 0 ? "good"
          : q.changeInPercent == 0 ? "warning"
          : "danger";

        var formatted_quote = {
            title : q.symbol+'\t'+q.lastTradePriceOnly+' ('+format_percent(q.changeInPercent)+')',
            title_link : "https://ca.finance.yahoo.com/q?s=" + q.symbol,
            text : q.name,
            color : color,
            fields : [
                {
                    title : 'Last Trade Date',
                    value : new Date(q.lastTradeDate).toString('hh:mm tt yyyy-MM-dd'),
                    short : true,
                },
                {
                    title : 'Earnings Per Share',
                    value : format_ratio(q.earningsPerShare),
                    short : true,
                },
                {
                    title : '52 Week Range',
                    value : q['52WeekLow'] + ' - ' + q['52WeekHigh'],
                    short : true,
                },
                {
                    title : 'Daily Volume',
                    value : q.volume,
                    short : true,
                },
                {
                    title : 'Price to Earnings Ratio',
                    value : format_ratio(q.peRatio),
                    short : true,
                },
                {
                    title : 'Dividend Yield',
                    value : format_ratio(q.dividendYield),
                    short : true,
                },
            ],
        };
        formatted_quotes.push(formatted_quote);
    });

    return formatted_quotes;
}

function format_percent(value) {
    var plus = value > 0 ? '+' : '';
    return plus + (value * 100).toFixed(3) + '%';
}

function format_ratio(value) {
    return value.toFixed(2);
}
