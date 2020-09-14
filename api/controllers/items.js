const moment = require('moment');                       // https://momentjs.com/
const jsesc = require('jsesc');                         // https://www.npmjs.com/package/string-escape      
const { validateItem } = require('../validation/item');
const mysql  = require('mysql');                        // https://www.npmjs.com/package/mysql
const { mysqlConfig } = require('../../config');
const connection = mysql.createConnection(mysqlConfig);

exports.getAllItems = (req, res) => {
    const sql = 'SELECT * FROM items ORDER BY item_name';
    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }
        res.status(200).json({
            message: `All items successfully retrieved.`,
            responseObject: result
        });
    })
};

exports.getItem = (req, res) => {
    const item_id = parseInt(req.params.id);
    const sql = `   SELECT i.*, 
                        r.rental_id, r.rental_number, r.delivery_date, 
                        c.customer_id, c.first_name, c.last_name
                    FROM items i
                        LEFT JOIN (
                            SELECT *
                            FROM rental_line_items
                            WHERE active_rental=1
                        ) rli
                            ON i.item_id = rli.item_id
                        LEFT JOIN rentals r
                            ON rli.rental_id = r.rental_id
                        LEFT JOIN customers c
                            ON r.customer_id = c.customer_id
                    WHERE i.item_id=${item_id}`;
    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }
        // ATG:: CALL PRIVATE FUNCTION TO FORMAT THE QUERIED ITEM DATA
        let formattedItem = _formatItem(result);
        res.status(200).json({
            message: `Item with ID: ${item_id} successfully retrieved.`,
            responseObject: formattedItem
        });   
    });
};

exports.getItemRentals = (req, res) => {
    const item_id = parseInt(req.params.id);
    const sql = `   SELECT r.rental_id, r.rental_number, r.delivery_date, r.rental_status,
                        c.customer_id, c.first_name, c.last_name
                    FROM rentals r
                        JOIN customers c
                            ON r.customer_id = c.customer_id
                        LEFT JOIN rental_line_items rli
                            ON r.rental_id = rli.rental_id
                    WHERE rli.item_id=${item_id}
                    ORDER BY r.delivery_date DESC`;

    connection.query(sql, (error, result) => {
        if(error) {
            throw error;
        }

        res.status(200).json({
            message: `Rentals for item with ID: ${item_id} successfully retrieved.`,
            responseObject: result
        });  
    });
};

exports.createNewItem = (req, res) => {
    // ATG:: VALIDATE THE REQUEST BODY TO CHECK FOR ANY KNOWN ISSUES BEFORE PROCESSING
    let errors = validateItem(req.body);
    if(errors.message) {
        res.status(422).json({
            error: true,
            message: errors.message
        });
    } else {
        let { item_name, item_description, tracking_number, serial_number, purchase_date, purchase_cost } = req.body;

        // ATG:: CHECK FOR UNIQUE VALUES
        connection.query(`SELECT * FROM items WHERE tracking_number=${tracking_number}`, (error, result) => {
            if (error) {
                throw error;
            }

            if(result.length > 0) {
                res.status(422).json({
                    error: true,
                    message: `Tracking Number must be unique, and ${tracking_number} is already in use. Please try again.`
                });
            } else {
                // ATG:: USE JS ESCAPE LIBRARY TO ESCAPE SPECIAL CHARS BEFORE INSERTING THEM INTO THE DB
                item_name           = jsesc(item_name);
                item_description    = jsesc(item_description);
                tracking_number     = jsesc(tracking_number);
                serial_number       = jsesc(serial_number);

                const sql = `   INSERT INTO items (item_name, item_description, tracking_number, serial_number, purchase_date, purchase_cost, item_status, insert_timestamp) 
                                VALUES('${item_name}', '${item_description}', '${tracking_number}', '${serial_number}', '${purchase_date}', '${purchase_cost}', 'ON HAND', '${moment().format('YYYY-MM-DD')}')`;
                connection.query(sql, (error, result) => {
                    if(error) {
                        throw error;
                    }
                    res.status(201).json({
                        message: `Item successfully created.`,
                        responseObject: {
                            item_id: result.insertId,
                            ...req.body
                        }
                    });
                });
            }
        });
    }
};

exports.updateItem = (req, res) => {
    // ATG:: VALIDATE THE REQUEST BODY TO CHECK FOR ANY KNOWN ISSUES BEFORE PROCESSING
    let errors = validateItem(req.body);
    if(errors.message) {
        res.status(422).json({
            error: true,
            message: errors.message
        });
    } else {
        const item_id = parseInt(req.params.id);
        let { item_name, item_description, tracking_number, serial_number, purchase_date, purchase_cost } = req.body;

        // ATG:: CHECK FOR UNIQUE VALUES; EXCLUDE THIS RECORD ID FROM RESULTS, SO THE ONLY THING THAT'S RETURNED IS OTHER MATCHING RECORDS
        connection.query(`SELECT * FROM items WHERE tracking_number=${tracking_number} AND item_id NOT IN(${item_id})`, (error, result) => {
            if (error) {
                throw error;
            }
    
            if(result.length > 0) {
                res.status(422).json({
                    error: true,
                    message: `Tracking Number must be unique, and ${tracking_number} is already in use. Please try again.`
                });
            } else {
                // ATG:: USE JS ESCAPE LIBRARY TO ESCAPE SPECIAL CHARS BEFORE INSERTING THEM INTO THE DB
                item_name           = jsesc(item_name);
                item_description    = jsesc(item_description);
                tracking_number     = jsesc(tracking_number);
                serial_number       = jsesc(serial_number);
                // ATG:: IF PURCHASE COST IS EMPTY, LEAVE IT AS $0.00
                purchase_cost       = (purchase_cost != '') ? purchase_cost : 0.00;
                const sql = `   UPDATE items 
                                SET item_name = '${item_name}', 
                                    item_description = '${item_description}', 
                                    tracking_number = '${tracking_number}', 
                                    serial_number = '${serial_number}',
                                    purchase_date = '${moment(purchase_date).format('YYYY-MM-DD')}',
                                    purchase_cost = '${purchase_cost}'
                                WHERE item_id = ${item_id}`;
                
                connection.query(sql, (error, result) => {
                    if (error) {
                        throw error
                    }
                    res.status(200).json({
                        message: `Item with ID: ${item_id} updated successfully.`,
                        responseObject: {
                            item_id,
                            ...req.body
                        }
                    });
                });
            }
        });
    }
};

exports.deleteItem = (req, res) => {
    const item_id = parseInt(req.params.id);
    const sql = `DELETE FROM items WHERE item_id = ${item_id}`;

    connection.query(sql, (error, result) => {
        if (error) {
        throw error;
        }
        res.status(200).json({
            message: `Item with ID: ${item_id} deleted successfully.`
        });
    });
};

/**********************************************************************************/
/**********************************************************************************/
/****************************** HELPER FUNCTIONS **********************************/
/**********************************************************************************/
/**********************************************************************************/

// ATG:: FUNCTION TO FORMAT A SINGLE ITEM'S RETURNED QUERY
const _formatItem = function(queryResult) {
    if(queryResult.length > 0) {
        // ATG:: CREATE THE FORMATTED RESULT OBJECT
        formattedResult = {
            item_id:            queryResult[0].item_id,
            item_name:          queryResult[0].item_name,
            item_description:   queryResult[0].item_description,
            tracking_number:    queryResult[0].tracking_number,
            serial_number:      queryResult[0].serial_number,
            purchase_date:      queryResult[0].purchase_date,
            purchase_cost:      queryResult[0].purchase_cost,
            item_status:        queryResult[0].item_status,
            hasRecords:         false,
            active_rental:      {
                active_rental_id:       queryResult[0].rental_id,
                active_rental_number:   queryResult[0].rental_number,
                active_delivery_date:   queryResult[0].delivery_date,
                active_customer_id:     queryResult[0].customer_id,
                active_first_name:      queryResult[0].first_name,
                active_last_name:       queryResult[0].last_name
            }
        };

        if(formattedResult['active_rental'].active_rental_id !== null) {
            formattedResult['hasRecords'] = true;
        }

        return formattedResult;
    }
    return queryResult;
}

// ATG:: FUNCTION TO CHECK TO SEE IF A PARTICULAR PROPERTY IS UNIQUE ACROSS ALL ITEMS
const _validateUniqueItemProperty = (columnName, columnValue, item_id_to_exclude = null) => {
    let sql;
    if(item_id_to_exclude == null) {
        sql = `SELECT * FROM items WHERE ${columnName}=${columnValue}`;
    } else {
        sql = `SELECT * FROM items WHERE ${columnName}=${columnValue} AND item_id NOT IN(${item_id_to_exclude})`;
    }

    connection.query(sql, (error, result) => {
        if (error) {
            throw error;
        }

        if(result.length > 0) {
            return {
                message: `${columnName} must be unique, and ${columnValue} is already in use. \nPlease try again.`
            };
        }

        return {};
    });
}