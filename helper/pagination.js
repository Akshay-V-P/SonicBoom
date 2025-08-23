async function paginate(model, limit, currentPage,findQuery, sort, populate) {
    let skip = (limit * currentPage) - limit
    let docCount = await model.countDocuments(findQuery||{})
    let totalPages = Math.ceil(docCount/limit)
    let result 
    if (sort) {
        if (populate) {
            result = await model.find(findQuery? findQuery:{}).populate(populate).sort(sort).skip(skip).limit(limit)
        } else {
            result = await model.find(findQuery? findQuery:{}).sort(sort).skip(skip).limit(limit)
        }
    } else if (populate) {
        result = await model.find(findQuery? findQuery:{}).populate(populate).skip(skip).limit(limit)
    } else {
        result = await model.find(findQuery).skip(skip).limit(limit)
    } 
    return {result, docCount, totalPages, currentPage}
}

module.exports = paginate