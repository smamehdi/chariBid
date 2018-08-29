const assert = require('assert');
const auctions = require('./auctions');

function test() {
    let listings =  auctions.getItems();
    assert(listings.length > 0);
}
test();
