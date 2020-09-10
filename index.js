
// Instructed by Angela (It's the best)

// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let List = ["Boil Egg", "Cook Food"];
// let WorkList = [];

// Connection with mongodb database "todolistDB"
mongoose.connect("mongodb+srv://shubham_dutta:dutta1234@cluster0.gxwml.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Creating the schema of "lists" collection
const ListSchema = new mongoose.Schema({
  name: String
})

// Creating another schema of "customList" collection
const customListSchema = new mongoose.Schema({
  name: String,
  items: [ListSchema]
})

//Creating List model with "lists" collection
const List = mongoose.model("List", ListSchema);

// Creating customList model with "customList" collection
const customList = mongoose.model("customList", customListSchema);


// Default values in List
const item1 = new List({
  name: "Boil Eggs"
})
const item2 = new List({
  name: "Cook foods"
})

const DefaultItems = [item1, item2]


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("views/css"));
app.set("view engine", "ejs");


// For getting "/" route
app.get("/", (req, res) => {

  const dateString = date.getDate();

  // find or read  all documents from database
  List.find(function (err, lists) {
    if (err) {
      console.log(err);
    } else {

      // Check if documents in the lists is 0 or not
      List.countDocuments(function (err, total) {
        console.log(total);
        if (total == 0) {
          // Insert in database
          List.insertMany(DefaultItems, function (err, docs) {
            console.log("Successfully inserted 2 documents");
            res.redirect("/");
          })
        } else {
          res.render("list", { title: dateString, newListItem: lists });
        }
      })
    }
  })

});

app.get("/about", (req, res) => {
  res.render("about");
});


// For getting "/customList" route
app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName);
  console.log(customListName);

  // Check for repitition of document creation and if doesn't exists then create new document if exists show the document by rendering [age]
  customList.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {

        // Create new document / list
        const list = new customList({
          name: customListName,
          items: DefaultItems
        })

        list.save();

        // for redirect to the custom router
        res.redirect("/" + list.name)
      } else {

        // Show existing list items 
        console.log(foundList);
        res.render("list", { title: customListName, newListItem: foundList.items })
      }
    }

  })
})



// For adding new items in both "/" route and "/customListname" route
app.post("/", (req, res) => {

  const title = req.body.add;
  let item = req.body.newItem;

  // Creating new document
  const newItem = new List({
    name: item
  })

  if (title === date.getDate()) {

    // Adding new document in the model of collection
    newItem.save();
    // redirecting to "/" route and read new document and add to the list
    res.redirect("/");
  } else {

    // find the document by name query and push new document to the custom document's "items" array
    customList.updateOne({ name: title }, { $push: { items: newItem } }, function (err, updated) {
      console.log(updated.nModified);
      res.redirect("/" + title);
    })

    // customList.findOne({ name: title }, function (err, foundList) {
    //   foundList.items.push(newItem);
    //   foundList.save();
    // })
  }

});


// Delete todo item from "lists" collection and "customList" collection and database on clicking checkbox
app.post("/delete", (req, res) => {
  const checkedId = req.body.delete;
  const listTitle = req.body.listName;

  // delete 1 document by <_id> name from database
  // <model_name>.findByIdAndDelete(<id>, <callback_function>)

  if (listTitle === date.getDate()) {

    List.findByIdAndDelete(checkedId, function (err, deleted) {
      if (err) {
        console.log(err);
      } else {
        console.log(deleted);
        res.redirect("/");
      }
    });
  } else {

    // Update the "items" array of "customList" collection using $pull operator
    // Syntax:
    // {$pull: {array: <value>|| {query} }}
    // instead of <model>.updateOne() 
    // you can use <model>.findOneAndUpdate()
    customList.updateOne({ name: listTitle }, { $pull: { items: { _id: checkedId } } }, function (err, deleted) {
      console.log(deleted.nModified);
      res.redirect("/" + listTitle)
    })
  }
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});




// // jshint esversion:6
// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date");

// const app = express();

// const List = ["Boil Egg", "Cook Food"];
// const WorkList = ["Do Coding", "Web Dev"];

// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static("views/css"));

// app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//   const dateString = date.getDay();
//   res.render("list", { title: dateString, newListItem: List, Path: req.path });
// });

// app.get("/wo?rk", (req, res) => {
//   res.render("list", { title: "Work", newListItem: WorkList, Path: req.path });
// });

// app.get("/about", (req, res) => {
//   res.render("about");
// });

// app.post("/", (req, res) => {
//   const item = req.body.newItem;

//   List.push(item);
//   console.log(List);
//   res.redirect("/");
// });

// app.post("/wo?rk", (req, res) => {
//   const item = req.body.newItem;

//   WorkList.push(item);
//   console.log(WorkList);
//   res.redirect("/work");
// });

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`Server started at port ${PORT}`);
// });

