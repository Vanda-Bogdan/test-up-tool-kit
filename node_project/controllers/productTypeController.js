const ApiError = require("../error/ApiError")
const {ProductType} = require("../models")

class ProductTypeController{
    async create(req, res){
        const {name} = req.body
        const productType = await ProductType.create({name})
        return res.json(productType)
    }

    async update(req, res){
        
    }


}

module.exports = new ProductTypeController()