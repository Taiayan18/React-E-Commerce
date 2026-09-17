import express from "express";
import { product } from "../model/productModel.js";
import { Query } from "mongoose";

export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, images, category, inStock } = req.body;

    if (!name || !price || !description || !image || !category) {
      return res.status(404).json({
        status: false,
        message: "Fill All Details",
      });
    }

    const exitproduct = await product.findOne({ name });

    if (exitproduct) {
      return res.status(400).json({
        status: false,
        message: "Product Already Created",
      });
    }

    const newProduct = await product.create({
      name,
      price,
      description,
      image,
      images: Array.isArray(images) ? images : [],
      category,
      inStock: inStock !== undefined ? inStock : true,
    });

    return res.status(201).json({
      status: true,
      message: "Product Succesfully Creating",
      data : newProduct
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Error in Creating Product ${error.message}`,
    });
  }
};

export const bulkData = async (req, res) => {
  try {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Payload must be an array of products",
      });
    }

    for (let i = 0; i < products.length; i++) {
      const { name, category, price, description, image } = products[i];

      if (!name || !price || !description || !image || !category) {
        return res.status(404).json({
          status: false,
          message: "Fill All Details",
        });
      }
    }

    const productlist = await product.insertMany(products, {
      ordered: false,
    });

    return res.status(201).json({
      status: true,
      message: `Succesfully BulkData Created`,
       data : productlist
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Erro in BulkData Creating ${error.message}`,
     
    });
  }
};

export const deleteData  = async (req,res) => {
    try {

        const {name} = req.params
        

       const exitproduct = await product.findOneAndDelete({name})

       if(!exitproduct){
        return res.status(404).json({
            status : false,
            message : "Product Not Found"
        })
       }

       return res.status(200).json({
        status : true,
        message : "Succesfully Product Deleted",
        data : exitproduct
       })
        
    } catch (error) {
         return res.status(500).json({
        status : false,
        message : `Error in Delet Product ${error.message}`
       })
    }
}
export const Updateproduct = async (req, res) => {
    try {

        const { name } = req.params;
        const { price, description, category, image, images, inStock } = req.body;

        const updateFields = { price, description, category, image };
        if (images !== undefined) updateFields.images = images;
        if (inStock !== undefined) updateFields.inStock = inStock;

        const existProduct = await product.findOneAndUpdate({ name }, updateFields, { new: true });

        if (!existProduct) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: "Product successfully updated",
            data: existProduct
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Error in update product: ${error.message}`
        });
    }
};

export const toggleStock = async (req, res) => {
    try {

        const { id } = req.params;
        const { inStock } = req.body;

        if (inStock === undefined) {
            return res.status(400).json({
                status: false,
                message: "inStock (true/false) is required"
            });
        }

        const existProduct = await product.findByIdAndUpdate(
            id,
            { inStock },
            { new: true }
        );

        if (!existProduct) {
            return res.status(404).json({
                status: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            status: true,
            message: `Product marked as ${inStock ? "In Stock" : "Out of Stock"}`,
            data: existProduct
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Error in updating stock status: ${error.message}`
        });
    }
};

export const getallproduct = async ( req,res ) => {
    try {

        const existProduct = await product.find()

        if(!existProduct){
            return res.status(400).json({
                status : false,
                message : "This product name is not avaliable"
            })
        }
         return res.status(200).json({
            status : true,
            message : "Data get Succesfully ",
            data : existProduct
         })
    } catch (error) {
        return res.status(500).json({
            status : false,
            message : `Error in Get all Data ${error.message}`
        })
    }
}