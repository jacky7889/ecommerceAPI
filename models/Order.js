const mongoose = require('mongoose')

const SingleOrderItemSchema = mongoose.Schema({
    name: {type:String, required:true},
    image: {type:String, required:true},
    price: {type:Number, required:true},
    amount: {type:Number, required:true},
    product: {
        type:mongoose.Schema.ObjectId,
        ref:'Product',
        required:true
    }
    
})

const OrderSchemea = mongoose.Schema({

    tax:{
        type:Number,
        required:true
    },
    shippingFee:{
        type:Number,
        required:true
    },
    subTotal:{
        type:Number,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['pending', 'failed', 'paid', 'delivered', 'canceled'],
        default:'pending'
    },
    orderItems:[SingleOrderItemSchema],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        require:true
    },
    clientSecret:{
        type:String,
        required:true
    },
    paymentIntentId:{
        type:String,
    }
})

module.exports = mongoose.model('Order', OrderSchemea)