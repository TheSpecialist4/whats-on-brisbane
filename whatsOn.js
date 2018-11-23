const request = require('request-promise');
const cheerio = require('cheerio');

const CONFIG = {
    url: 'https://www.visitbrisbane.com.au/whats-on/this-week?sc_lang=en-au',
    transform: body => {
        return cheerio.load(body);
    }
}

exports.getEvents = () => {
    return request(CONFIG)
        .then($ => {
            const events = [];
            $('h3').each(function(i, ele) {
                const tokens = ($(this).text()).split('|');
                // both event date and name are present
                if (tokens.length > 1 && events.length < 5) {
                    events.push({
                        event: tokens[1].trim(),
                        date: tokens[0].trim()
                    });
                }
            })
            console.log(events);
            return events;
        })
        .catch(err => {
            console.error(err);
        })
}