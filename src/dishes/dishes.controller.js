const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes })
}

function hasValidId(req, res, next){
  const { dishId } = req.params
  const { id } = req.body.data
  if(!id || id === dishId){
    return next()
  }
  next({
    status: 400,
    message: `Dish id, ${id}, not valid`
  })
}

function dishExist(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id == Number(dishId));
  
  if (foundDish) {
    res.locals.dish = foundDish
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`
  })
}

function dishHasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name != "")
  return next();
  next({
    status: 400,
    message: "A name property is required."
  })
}

function dishHasDesc(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) 
  return next();
  next({
    status: 400,
    message: "A description property is required."
  })
}

function goodImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url &&image_url!="")
  return next();
  next({
    status: 400,
    message: "A image_url property is required."
  })
}

function dishHasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (Number(price) > 0 && Number.isInteger(price))
  return next();
  next({
    status: 400,
    message: "A price property is required or is incorrect."
  })
}

function createDish(req, res, next) {
    const {data: { name, price, description, image_url} = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        price,
        description,
        image_url
    };
    dishes.push(newDish); // Assuming dishesData is an array to store dishes
    res.status(201).json({ data: newDish });
}

function getDish(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id == Number(dishId));
    if (foundDish) {
        res.json({ data: foundDish });
    } else {
        next({ status: 404, message: `Dish ${dishId} not found.` });
    }
}

function updateDish(req, res, next) {
    const { dishId } = req.params;
    const foundIndex = dishes.findIndex(dish => dish.id == Number(dishId));
    if (foundIndex !== -1) {
         const {data: { name, price, description, image_url} = {} } = req.body;
        dishes[foundIndex] = {
            ...dishes[foundIndex],
            name,
            price,
            description,
            image_url
        };
        res.json({ data: dishes[foundIndex] });
    } else {
        next({ status: 404, message: `Dish ${dishId} not found.` });
    }
}



module.exports = {
  list,
  create: [dishHasName, dishHasDesc, goodImage, dishHasPrice, createDish],
    read: [getDish],
  update: [dishExist, hasValidId, dishHasName, dishHasDesc, goodImage, dishHasPrice, updateDish],
}