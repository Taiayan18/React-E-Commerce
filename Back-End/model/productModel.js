import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    category : {
         type : String,
        required : true,
    },
    price : {
        type : Number,
        required : true,
    },
    description : {
         type : String,
        required : true,
    },
    image : {
        type : String,
        require : true
    },
    // Extra gallery images (image field upar hamesha cover/primary photo rehta hai)
    images : {
        type : [String],
        default : []
    },
    inStock : {
        type : Boolean,
        default : true
    }

},{timestamps : true})


export const product = mongoose.model("product", productSchema)