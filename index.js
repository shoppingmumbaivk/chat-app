const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const JSAlert = require("js-alert");
const io = require('socket.io')(8000);

// create a new Express app server object
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/static', express.static('assets'))
app.use('/static', express.static('images'))
// set the port for the Node application
const port = process.env.port || 3456;

var name = "";

// set the file path for the HTML file
const htmlPath = path.join(__dirname + "/index.html");

const client = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres",
    password: "rit123XYZ",
    port: "5432"
  });

  // 'GET' route for the web app

  app.get("/home.html", (req, resp) => {
    if(name == ""){
      resp.redirect("/")
    }
    else{
      const users = {}

      io.on('connection', socket => {
          socket.on('new-user-joined', () => {
              users[socket.id] = name;
              socket.broadcast.emit('user-joined', users[socket.id])
          });

          socket.on('send', message => {
              socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
          });

          socket.on('disconnect', message =>{
              socket.broadcast.emit('leave', users[socket.id]);
              delete users[socket.id];
          });
      })
      resp.sendFile(__dirname + "/home.html")
    }
  })
  app.get("/", (req, resp) => {
  // send the HTML file back to the front end
    resp.sendFile(htmlPath);
    app.post('/login', function(req, resp) {
        client.query('SELECT email, password, name FROM user_table', (err, res)=>{
            if(err){
                throw err
            }
            for(var i = 0; i < res.rows.length; i++){
              if(res.rows[i]['email'] == req.body.user && res.rows[i]['password'] == req.body.pass){
                  name = res.rows[i]['name']
                  return resp.redirect('/home.html')
                }
            }
            resp.redirect('/fail.html')
        })
    })
  });

  app.get('/fail.html', (req, resp) => {
    resp.sendFile(__dirname + "/fail.html")
    app.post('/login', function(req, resp) {
        client.query('SELECT email, password FROM user_table', (err, res)=>{
            if(err){
                throw err
            }
            for(var i = 0; i < res.rows.length; i++){
              if(res.rows[i]['email'] == req.body.user && res.rows[i]['password'] == req.body.pass){
                  name = res.rows[i]['name']
                  return resp.redirect('/home.html')
              }
            }
            resp.redirect('/fail.html')
        })
    })
  })

  app.get('/duplicate.html', (req, resp) => {
    resp.sendFile(__dirname+"/duplicate.html")
  })

  app.get('/register.html', (req, resp) => {
    resp.sendFile(__dirname+"/register.html")
    app.post('/register', (req, resp) => {
      var address = `${req.body.city}` + ', ' + `${req.body.state}` + ', ' + `${req.body.country}` + ', ' + `${req.body.pincode}`
        client.query('INSERT INTO user_table (name, email, password, age, primary_skill, address) VALUES ($1, $2, $3, $4, $5, $6);', [req.body.name, req.body.email, req.body.pass, req.body.age, req.body.pskill, address] , (err, res) => {
            if(err){
              if(err.code == '23505'){
                resp.redirect('/duplicate.html')
              }
              else{
                throw err
              }
            }
            else{
              resp.redirect('/')
            }
        })
    });
  });
    
  var server = app.listen(port, function () {
    console.log(`\nPostgres Node server is running on port: ${server.address().port}`)
  }) 