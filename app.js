const express = require('express');
const app = express();
var cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const expressjwt = require('express-jwt');
//const jwksRsa = require('jwks-rsa');
const jwt = require("jsonwebtoken");

const connection = require('./database');
const getperson = require('./services/person');
const gethier = require('./services/hierarchy');

const router = express.Router();
const secretKey = "topSecretKey";


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded()); //Parse URL-encoded bodies
app.use(morgan('combined'));


app.use('/api-docs', require('./swagger'));


app.get('/', (req, res) => res.send('Alive version 1.00'));
app.get('/members', async function(req, res, next) { res.json(await getperson.getMultiple(req.query.page))});
app.get('/member/:memberId', async function(req, res, next) { res.json(await getperson.getSingle(req.params.memberId))});
app.post('/member/add', async function(req, res, next) { res.status(201).json(await getperson.addSingle(req.body))});
app.get('/hier/getnode/:nodeId',async function(req, res, next) { res.json(await gethier.getSingle(req.params.nodeId))});
app.get('/hier/getpath/:nodeId',async function(req, res, next) { res.json(await gethier.getPath(req.params.nodeId))});
app.get('/hier/getchildren/:nodeId',async function(req, res, next) { res.json(await gethier.getChild(req.params.nodeId))});
app.post("/hier/addnode", async function(req, res, next) {res.json(await gethier.addnode(req.body))} );

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  
  return;
});


//https://blog.logrocket.com/node-js-express-js-mysql-rest-api-example/
https://jasonwatmore.com/post/2020/09/08/nodejs-mysql-boilerplate-api-with-email-sign-up-verification-authentication-forgot-password
//https://joi.dev/api/?v=17.4.2
//https://austinhale.medium.com/building-a-node-api-with-express-and-google-cloud-sql-9bda260b040f
//https://www.sohamkamani.com/nodejs/oauth/
//https://codequs.com/p/BkjN5PGa2
//https://codequs.com/p/SkAyBJiWV/node-js-with-passport-authentication-full-project

app.listen(3000, () => console.log('Example app listening on port 3000!'));
