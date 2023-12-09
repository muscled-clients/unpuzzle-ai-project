const express = require('express');
const app = express();
const port = 5000;
const cors = require("cors")
require("dotenv").config() 

const { chatgpt }=require("./controllers/chatgpt.js")

app.use(cors())
app.use(express.json());

app.post('/', chatgpt);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
