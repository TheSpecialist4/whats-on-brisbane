const request = require('request-promise');
const cheerio = require('cheerio');

const CONFIG = {
    url: 'https://www.visitbrisbane.com.au/whats-on/this-week?sc_lang=en-au',
    transform: body => {
        return cheerio.load(body);
    }
}

request(CONFIG)
    .then($ => {
        const events = [];
        $('h3').each(function(i, ele) {
            events.push($(this).text());
        })
        console.log(events);
    })
    .catch(err => {
        console.error(err);
    })