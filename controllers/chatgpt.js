const OpenAI = require("openai") ;

const openai = new OpenAI();

async function chatgpt(req, res) {

    

  console.log(req.body.question)
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: req.body.question }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
  res.status(200).send({"body":completion.choices});
}

module.exports = {chatgpt}