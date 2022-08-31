require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({//Schema yı böyle tanımlıyoruz.
  email: String,
  password: String
});

//Key görevi gören uzun bir string
//Schema ya encrypt i plugin olarak ekliyoruz.Key görevi gören secret ı nesne içinde veriyoruz şifrelenecek alan ile birlikte
userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});
//DB ye kayıt yaparken password encrypted olur.DB den çağırırken decrypted olur.

const User = mongoose.model("user", userSchema);


app.get("/", function(req, res) {
  res.render("home");
});
app.get("/login", function(req, res) {
  res.render("login");
});
app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  new User({
    email: req.body.username,
    password: req.body.password
  }).save(function(err) {
    if (!err) res.render("secrets");
    else res.send(err);
  });

});

app.post("/login", function(req, res) {

  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username},function(err, foundUser) {
    if(err) res.send(err);
    else if(foundUser){//Kullanıcı varsa
      if(foundUser.password === password){//password doğru mu
        res.render("secrets");
    }else res.send("password yanlış");
    }
    else res.send("Kullanıcı bulunamadı");
  }
  );

});









app.listen(3000, function() {
  console.log("Server started on port 3000");
})
