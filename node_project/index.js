const PORT = 3000
const HOST = '127.0.0.1'

const express = require("express")
const sequelize = require("./db")
const models = require("./models")
const router = require("./routes/index")
const errorHandler = require('./middleware/ErrorHandlingMiddleware')

const app = express()
//app.use(cors())
app.use(express.json())
app.use('/api', router)



app.use(errorHandler)

const start = async () => {
    try {

        await sequelize.authenticate()
        await sequelize.sync()
        console.log('DB connected')
        app.listen(PORT, () => {
            console.log(`Server started: http://localhost:${PORT}`)
        });

    }
    catch (e) {
        console.log(e)
    }
}

start();


app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

/*app.get("/user/:user_id", (request, response) => {
    response.send(`UserID: ${request.params.user_id}`);
});*/

