//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true})
.then(function(){console.log("Connected");}); //{useNewUrlParser: true}

const itemsSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema)

const exercise = new Item({
  name: "Habit 1"
});

const read = new Item({
  name: "Habit 2"
});

const learnCrypto = new Item({
  name: "Habit 3"
});

const defaultItems = [exercise, read, learnCrypto];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {

const day = date.getDate();

  Item.find({})
  .then((items) => {
    if (items.length === 0){
      Item.insertMany(defaultItems).then((result) => {
        console.log('Documents inserted successfully:', result);
      })
      .catch((error) => {
        console.error('Error inserting documents:', error);
      });
      res.redirect("/");
    } else {
      console.log(items);
      res.render("list", {listTitle: day, newListItems: items});
    }
  })


});

app.post("/", function(req, res){

  const i = req.body.newItem;
  const item = new Item({name: i});
  const listName = req.body.list.toLowerCase();
  if (listName == date.getDate()){
    item.save().then(()=>{
      console.log("Item inserted");
    })
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then((list)=>{
      list.items.push(item);
      list.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req, res){
  const itemId = req.body.checkBox;
  const list = req.body.list;
  if (list === date.getDate()){
    Item.findByIdAndRemove(itemId)
    .catch((err)=> {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.updateOne({name: list.toLowerCase()}, {$pull : {items : {_id: itemId} } } )
    .then(()=>{
      res.redirect("/"+list.toLowerCase());
    })
    .catch((err)=> {
      console.log("Error is: " + err);
    });
  }
});

app.get("/:listName", function(req,res){
  const listName = req.params.listName;
  console.log(listName);
  List.findOne({name: listName})
  .then((list)=>{
    if (list){
      if (_.lowerCase(list.name) === _.lowerCase(listName)){
        var n = list.name[0].toUpperCase() + list.name.slice(1, list.name.length);
        res.render("list", {listTitle: n, newListItems: list.items});
      } 
    } else {
      console.log(list);
      const listItem = new List({
        name: listName,
        items: defaultItems
      });
      listItem.save().then(()=>{
        console.log("Successfully added.");
        res.redirect("/" + listName)
      });
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
