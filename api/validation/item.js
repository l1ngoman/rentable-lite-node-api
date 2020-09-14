const validateItem = (itemObject) => {
    if(itemObject.item_name == '') {
        return {
            message: "Item name is required. Please try again."
        };
    }
    if(itemObject.tracking_number == '') {
        return {
            message: "Tracking Number is required. Please try again."
        };
    }
    if(itemObject.purchase_date == '') {
        return {
            message: "Purchase Date is required. Please try again."
        };
    }
    
    return {};
};

module.exports = {
    validateItem
};