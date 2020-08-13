// IMPORT DEPENDENCIES
const express       = require('express');       // https://expressjs.com/
const morgan        = require('morgan');        // https://www.npmjs.com/package/morgan
const bodyParser    = require('body-parser');   // https://www.npmjs.com/package/body-parser
const app           = express();

// IMPORT ROUTES
const itemRoutes        = require('./api/routes/items');
const customerRoutes    = require('./api/routes/customers');
const userRoutes        = require('./api/routes/users');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// HANDLE CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if(req.method === 'Options') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
});

app.use('/items', itemRoutes);
app.use('/customers', customerRoutes);
app.use('/users', userRoutes);

// CATCH ANY OTHER ROUTES HERE WITH ERRORS BY ELIMINATING THE URL PARAM
app.use((req, res, next) => {
    const error = new Error('Page not found.');
    error.status = 404;
    next(error);
});

// THIS WILL CATCH ALL ERRORS FOR THE APP (INCLUDING THE 404 ABOVE)
app.use((error, req, res, next) => {
    // SET THE STATUS TO EITHER THE INCOMING ERROR'S STATUS OR 500 BY DEFAULT
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;