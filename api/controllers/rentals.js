const { mysqlConfig } = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(mysqlConfig);

const getAllRentals = (req, res) => {
    const sql = 'SELECT * FROM rentals ORDER BY order_number ASC';
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `All rentals successfully retrieved.`,
            responseObject: result
        });
    })
};

const getRental = (req, res) => {
    const rental_id = parseInt(req.params.id);
    const sql = `SELECT * FROM rentals WHERE rental_id = ${rental_id}`;
    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `Rental with ID: ${rental_id} successfully retrieved.`,
            responseObject: result
        });   
    });
};
    
const createNewRental = (req, res) => {
    const {  order_number, customer_id, item_id, status } = req.body;
    const sql = `INSERT INTO rentals ( order_number, customer_id, item_id, status) VALUES('${order_number}', '${customer_id}', '${item_id}', '${status}')`;
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(201).json({
            message: `Rental successfully created.`,
            responseObject: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};
    
const updateRental = (req, res) => {
    const rental_id = parseInt(req.params.id)
    const { order_number, customer_id, item_id, status } = req.body;
    const sql = (`
                UPDATE rentals 
                SET order_number = '${order_number}', 
                customer_id = '${customer_id}', 
                status = '${status}' 
                WHERE rental_id = ${rental_id}`
    );
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Rental with ID: ${rental_id} updated successfully.`,
            responseObject: {
                rental_id,
                ...req.body
            }
        });
        }
    )
};
    
const deleteRental = (req, res) => {
    const rental_id = parseInt(req.params.id);
    const sql = `DELETE FROM rentals WHERE rental_id = ${rental_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
        throw error;
        }
        res.status(200).json({
            message: `Rental with ID: ${rental_id} deleted successfully.`
        });
    });
};

module.exports = {
    getAllRentals,
    getRental,
    createNewRental,
    updateRental,
    deleteRental
};