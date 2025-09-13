

function calculateOffer(price, offer, categoryOffer) {
    const maxValue = Math.max(parseInt(categoryOffer), parseInt(offer))
    console.log(maxValue)
    return (price-(price/100*maxValue)).toFixed(2)
}

module.exports = calculateOffer