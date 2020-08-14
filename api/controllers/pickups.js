const config = require('../../config');
const mysql  = require('mysql'); // https://www.npmjs.com/package/mysql
const connection = mysql.createConnection(config);

const getAllPickups = (req, res) => {
    const sql = 'SELECT * FROM pickups ORDER BY order_number ASC';
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `All pickups successfully retrieved.`,
            responseObject: result
        });
    })
};

const getPickup = (req, res) => {
    const pickup_id = parseInt(req.params.id);
    const sql = (`
        SELECT  p.order_number as Pickup_Number, p.status as Pickup_Status
                r.order_number as Rental_Number, r.status,
                i.*,
                c.*
        FROM pickups p
        LEFT JOIN rentals r
            ON p.pickup_id = r. pickup_id
        LEFT JOIN items i
            ON r.item_id = i.item_id
        LEFT JOIN customers c
            ON r.customer_id = c.customer_id
        WHERE pickup_id = ${pickup_id}
    `);
    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }
        res.status(200).json({
            message: `Pickup with ID: ${pickup_id} successfully retrieved.`,
            responseObject: result
        });   
    });
};
    
const createNewPickup = (req, res) => {
    const { order_number, rental_id, status_open } = req.body;
    const sql = `INSERT INTO pickups ( order_number, rental_id, status_open) VALUES('${order_number}', '${rental_id}', '${status_open}')`;
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `Pickup successfully created.`,
            responseObject: {
                id: result.insertId,
                ...req.body
            }
        });
    });
};
    
const updatePickup = (req, res) => {
    const pickup_id = parseInt(req.params.id)
    const { order_number, rental_id, status_open} = req.body;
    const sql = (`
                UPDATE pickups 
                SET order_number = '${order_number}', 
                rental_id = '${rental_id}', 
                status_open = '${status_open}' 
                WHERE pickup_id = ${pickup_id}`
    );
    connection.query(sql, (error, result) => {
        if (error) {
            throw error
        }
        res.status(200).json({
            message: `Pickup with ID: ${pickup_id} updated successfully.`,
            responseObject: {
                pickup_id,
                ...req.body
            }
        });
    });
};
    
const deletePickup = (req, res) => {
    const pickup_id = parseInt(req.params.id);
    const sql = `DELETE FROM pickups WHERE pickup_id = ${pickup_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
        throw error;
        }
        res.status(200).json({
            message: `Pickup with ID: ${pickup_id} deleted successfully.`
        });
    });
};

module.exports = {
    getAllPickups,
    getPickup,
    createNewPickup,
    updatePickup,
    deletePickup
};