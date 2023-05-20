const ApiError = require("../error/ApiError")
const { User } = require("../models")

class UserController {
    async registration(req, res){
        
    }

    async registrationPost(req, res){
        const {full_name, email, password} = req.body
        const user = await User.create({full_name, email, password})
        return res.json(user)
    }

    async login(req, res){

    }

    async getAll(req, res){
        const users = await User.findAll()
        return res.json(users)
    }

    async check(req, res, next){
        const {id} = req.query
        if(!id){
            return next(ApiError.badRequest('ID not set'))
        }
        res.json(id)
    }
}

module.exports = new UserController()