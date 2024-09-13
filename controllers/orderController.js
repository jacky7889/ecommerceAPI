const Order = require('../models/Order')
const Product = require('../models/Product')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {checkPermissions} = require('../utils')

const fakeStripeAPI = async ({amount, currency}) => {
    const client_secret = 'someRandomValue'
    return {client_secret, amount}
}

const createOrder = async (req, res) => {
    const {items:cartItems, tax, shippingFee} = req.body
   
    if(!cartItems || cartItems > 1){
        throw new CustomError.BadRequestError('No cart item provided')
    }
    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('No tax or shipping fee provided')
    }

    let orderItems = []
    let subTotal = 0

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new CustomError.NotFoundError(`No product with it: ${item.product}`)
        }

        const{name, price, image, _id} = dbProduct
        const singleOrderItem = {
            amount:item.amount,
            name,
            price,
            image,
            product:_id

        }
        orderItems = [...orderItems, singleOrderItem]
        subTotal += item.amount * price
        // console.log(orderItems)
        // console.log(subtotal)
    }

    const total = tax + shippingFee + subTotal

    const paymentIntent = await fakeStripeAPI({
        amount:total,
        currency:'usd'
    })
    
  const order = await Order.create({orderItems, total, subTotal, tax, shippingFee, clientSecret:paymentIntent.client_secret,user:req.user.userId})
  res.status(StatusCodes.CREATED).json({order, clientSecret:order.client})
}

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({orders, count:orders.length})
}

const getSingleOrder = async (req, res) => {
    const{id:orderId} = req.params
    const order = await Order.findOne({_id:orderId})

    if(!order){
        throw new CustomError.BadRequestError(`No order with id: ${orderId}`)
    }
    checkPermissions(req.user,order.user)
    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async (req, res) => {
    const orders = await Order.find({user:req.user.userId})
    res.status(StatusCodes.OK).json({orders, count:orders.length})
}

const updateOrder = async (req, res) => {
     const{id:orderId} = req.params
    const{paymentIntentId} = req.body
    console.log(req.body)
    const order = await Order.findOne({_id:orderId})

    if(!order){
        throw new CustomError.BadRequestError(`No order with id: ${orderId}`)
    }
    checkPermissions(req.user,order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({order})
}

const deleteOrder = async (req, res) => {
    res.send('delete orders')
}


module.exports = {
    getAllOrders, getSingleOrder, getCurrentUserOrders,
  createOrder, updateOrder, deleteOrder
}