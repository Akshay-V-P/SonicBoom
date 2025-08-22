function calculateOffer(price, offer) {
    return price-(price/100*offer)
}

module.exports = calculateOffer