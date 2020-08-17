const { mysqlConfig } = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(mysqlConfig);

const getAllCustomers = (req, res) => {
    const sql = 'SELECT * FROM customers ORDER BY last_name';
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `All customers successfully retrieved.`,
            responseObject: result
        });
    })
};

const getCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `SELECT * FROM customers WHERE customer_id = ${customer_id}`;
    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} successfully retrieved.`,
            responseObject: result
        });   
    });
};

const createNewCustomer = (req, res) => {
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = (`  
            INSERT INTO customers (first_name, last_name, address_1, address_2, city, state, zip, phone, email) 
            VALUES('${first_name}', '${last_name}', '${address_1}', '${address_2}', '${city}', '${state}', '${zip}', '${phone}', '${email}')
    `);
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(201).json({
            message: `Customer successfully created.`,
            responseObject: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};

const updateCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id)
    const { first_name, last_name, address_1, address_2, city, state, zip, phone, email } = req.body;
    const sql = (`
        UPDATE customers 
        SET first_name  = '${first_name}', 
            last_name   = '${last_name}', 
            address_1   = '${address_1}', 
            address_2   = '${address_2}',
            city        = '${city}',
            state       = '${state}',
            zip         = '${zip}',
            phone       = '${phone}',
            email       = '${email}',
        WHERE customer_id = ${customer_id}
    `);
    
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} updated successfully.`,
            responseObject: {
                user_id,
                ...req.body
            }
        });
        }
    )
};

const deleteCustomer = (req, res) => {
    const customer_id = parseInt(req.params.id);
    const sql = `DELETE FROM customers WHERE customer_id = ${customer_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
        throw error;
        }
        res.status(200).json({
            message: `Customer with ID: ${customer_id} deleted successfully.`
        });
    });
};

module.exports = {
    getAllCustomers,
    getCustomer,
    createNewCustomer,
    updateCustomer,
    deleteCustomer
};