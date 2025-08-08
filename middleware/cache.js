const nocache = () => {
    return (req, res, next) => {
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, private, max-age=0, s-maxage=0',
            'Pragma': 'no-cache',
            'Expires': '-1',
            'Last-Modified': new Date().toUTCString(),
            'ETag': false,
            'Surrogate-Control': 'no-store',
            'Vary': '*'
        })
        
        res.set('ETag', false)
        
        console.log(`No-cache applied to: ${req.method} ${req.path}`) // Debug log
        next()
    }
}

module.exports = nocache