const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");


function hasValidId(req, res, next){
  const { orderId } = req.params
  const { id } = req.body.data
  if(!id || id === orderId){
    return next()
  }
  next({
    status: 400,
    message: `Dish id, ${id}, not valid`
  })
}

function orderExist(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id == Number(orderId));
  
  if (foundOrder) {
    res.locals.order = foundOrder
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`
  })
}

function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo && deliverTo!="")
  return next();
  next({
    status: 400,
    message: "A deliverTo property is required."
  })
}

function hasMobile(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber && mobileNumber!="")
  return next();
  next({
    status: 400,
    message: "A mobileNumber property is required."
  })
}

function validateOrderStatus(req, res, next) {
  const { data: { status } = {} } = req.body;

  // Check if 'status' property exists and is a non-empty string
  if (!status || typeof status !== 'string' || status.trim().length === 0) {
    return next({
      status: 400,
      message: 'Order should have a non-empty status.'
    });
  }


  const validStatusValues = ['pending', 'processing', 'completed'];
  if (!validStatusValues.includes(status.toLowerCase())) {
    return next({
      status: 400,
      message: 'Order status is not valid.'
    });
  }

  
  next();
}


function validateDish(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  // Check if 'dishes' property exists and it's an array
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: 'Order should contain a non-empty array of dishes with quantities.'
    });
  }

  for (const dish of dishes) {
    // Check if each dish is missing or empty
    if (!dish || Object.keys(dish).length === 0) {
      return next({
        status: 400,
        message: 'Each dish in the order should be a non-empty object.'
      });
    }

    const quantity = dish.quantity;
    // Check if 'quantity' is a positive integer
    if (!quantity || quantity <= 0 || typeof quantity !== "number" || !Number.isInteger(quantity)) {
      return next({
        status: 400,
        message: `Dish ${dish.id || 'unknown'} must have a quantity that is an integer greater than 0`
      });
    }
  }

 
  next();
}

function validateDeleteOrder(req, res, next) {
  const { orderId } = req.params;
  const orderToDelete = orders.find(order => order.id === orderId);

  // Check if the order exists
  if (!orderToDelete) {
    return res.status(404).json({ error: `Order ${orderId} not found.` });
  }

  // Check if the order status is 'pending' before deletion
  if (orderToDelete.status !== 'pending') {
    return res.status(400).json({ error: `Order ${orderId} status should be 'pending' for deletion.` });
  }

  // If all conditions pass, move to the next middleware (deleting the order)
  next();
}


// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders })
}


function getOrder(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find(order => order.id == Number(orderId));
    if (foundOrder) {
        res.json({ data: foundOrder });
    } else {
        next({ status: 404, message: `Order ${orderId} not found.` });
    }
}

function createOrder(req, res, next) {
     const {data: { deliverTo, mobileNumber, status, dishes} = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    };
  orders.push(newOrder)
    // Logic to add the new order to your orders data
    res.status(201).json({ data: newOrder });
}

function updateOrder(req, res, next) {
    const { orderId } = req.params;
    const {data: { deliverTo, mobileNumber, status, dishes} = {} } = req.body;

    // Find the order in the orders array
    const foundOrderIndex = orders.findIndex(order => order.id === orderId);
        orders[foundOrderIndex] ={
          ...orders[foundOrderIndex],
           deliverTo,
           mobileNumber,
           status,
           dishes
          };
    res.json({ data: orders[foundOrderIndex] });
}

function deleteOrder(req, res, next) {
    const { orderId } = req.params;

    // Find the index of the order in the orders array
    const foundOrderIndex = orders.findIndex(order => order.id === Number(orderId));

    // Remove the order from the orders array
    const deletedOrder = orders.splice(foundOrderIndex, 1);

      res.status(204).send(); 
}


  
  module.exports = {
    list,
    read: [getOrder],
    create: [ hasMobile, hasDeliverTo, validateDish, createOrder],
    update: [orderExist, hasValidId, validateOrderStatus, validateDish, hasMobile, hasDeliverTo, updateOrder],
    delete: [validateDeleteOrder, deleteOrder],
  }