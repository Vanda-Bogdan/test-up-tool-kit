const PORT = 3000
const HOST = '127.0.0.1'

const express = require("express")

const app = express()

app.get("/", (request, response) => {
    response.sendFile(__dirname + "/views/index.html");
});

app.get("/user/:user_id", (request, response) => {
    response.send(`UserID: ${request.params.user_id}`);
});

app.listen(PORT, () => {
    console.log(`Server started: http://localhost:${PORT}`)
});