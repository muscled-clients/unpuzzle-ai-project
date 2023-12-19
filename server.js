const express = require('express');
const app = express();
const cors = require("cors")
require("dotenv").config() 

const port = process.env.PORT;
const { chatgpt }=require("./controllers/chatgpt.js")

app.use(cors())
app.use(express.json());

app.get('/', (req, res)=>{
  res.status(200).send({ok:"success", message:"Wew hare ready to serve"})
});
app.post('/', chatgpt);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
