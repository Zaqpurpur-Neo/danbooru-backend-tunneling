const express = require("express");
const cors = require("cors");
const app = express();

const apiRoute = require('./api-route')
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors())
app.use("/api", apiRoute)

app.get("/", (req, res) => {
	res.status(200).send({
		"message": "Brand new day => go to '/api'"
	})
})

app.listen(PORT, () => console.log(`[INFO]: Server start at http://localhost:${PORT}`))

