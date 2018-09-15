const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require("@pusher/chatkit-server");

const app = express();

const chatkit = new Chatkit.default({
   instanceLocator: 'v1:us1:e2bfbf0b-aa0b-4ee7-905a-49c5c746cf34',
   key: '4d61af76-8d89-4da4-be56-3b79c1e3a891:+afgqWEPAvJvKu8IMzZqcId8wJUaiE2ZEuXQLopJIas='
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/users', (req, res) => {
   const { username } = req.body;
   chatkit.createUser({
      id: username,
      name: username
   })
   .then(() => {
      console.log(`User created: ${username}`);
   })
   .catch(err => {
      if (err.error === 'services/chatkit/user_already_exists') {
         console.log(`User already exists: ${username}`);
      } else {
         res.status(err.status).json(err);
      }
   });
});

app.post('/authenticate', (req, res) => {
   const authData = chatkit.authenticate({userId: req.query.user_id});
   res.status(authData.status).send(authData.body);
});

const port = 3001;
app.listen(port, () => {
   console.log(`Running on port: ${port}`);
});