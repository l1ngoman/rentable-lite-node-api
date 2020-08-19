const jwt = require('jsonwebtoken'); // https://www.npmjs.com/package/jsonwebtoken

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        // ATG:: ADD DECODED TOKEN TO THE REQUEST
        req.userData = decoded;
        next();;
    } catch (error) {
        console.log(error);
        return res.status(401).json({
            message: "Authentication failed."
        });
    }
};