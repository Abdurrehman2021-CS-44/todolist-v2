//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true})
.then(() => console.log('Connected!'));; //{useNewUrlParser: true}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const exercise = new Item({
  name: "Do Exercise"
});

const read = new Item({
  name: "Read Book"
});

const learnCrypto = new Item({
  name: "Learn Crypto"
});

const defaultItems = [exercise, read, learnCrypto];

Item.insertMany(defaultItems).then((result) => {
  console.log('Documents inserted successfully:', result);
  mongoose.connection.close();
})
.catch((error) => {
  if (error.hasOwnProperty('writeErrors')){
    console.error('Error inserting documents:', error);
  }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();

  res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
