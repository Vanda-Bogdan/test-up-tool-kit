const Router = require('express') 
const router = new Router()
const userRouter = require('./userRouter')
const productTypeRouter = require('./productTypeRouter')

router.use('/user', userRouter)
router.use('/productType', productTypeRouter)

module.exports = router