const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const https = require("https");
const request = require("request");
const _ = require("lodash");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://admin_Nitin:Nitin9797%40@cluster0.k50ci.mongodb.net/todolistDb?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);
// mongoose.connect("mongodb://localhost:27017/todolistDb",{useNewUrlParser:true});
const itemsSchema = mongoose.Schema({
  name: String,
});
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({
  name: "Welcome to Todolist!",
});

const item2 = new Item({
  name: "Press the + to add a new item",
});
const item3 = new Item({
  name: "<--- Press this to delete an item",
});
const defaultArray = [];
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
let day = date.getDay();

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});
app.post("/", (req, res) => {
  const firstName = req.body.FirstName;
  const lastName = req.body.LastName;
  const email = req.body.Email;
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data); // this is the data sent to the mailchimp
  // here we want to post the data to the external resource
  // similarly as we want to get the data from the external resource as we did in open weatherApp
  const url = "https://us14.api.mailchimp.com/3.0/lists/2ea448978c";
  const options = {
    method: "POST",
    auth: "nitin:3f9a4997975f9581da856e7c2078511d-us14", // username : apikey for authentication
  };
  const request = https.request(url, options, function (response) {
    if (response.statusCode === 200) {
      // organize('success');
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function (data) {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});
app.post("/success", (req, res) => {
  res.redirect("/today");
});
app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.get("/today", (req, res) => {
  Item.find({}, function (err, itemsarray) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", { listTitle: day, NewListItems: itemsarray });
    }
  });
  // Item.find({},function(err,itemsarray){
  //     if(itemsarray.length===0){
  //         Item.insertMany(defaultArray,function(err){
  //             if(err){
  //                 console.log(err);
  //             }else{
  //                 console.log("successfully saved data to database");
  //             }
  //         });
  //      res.redirect("/");
  //     }else{
  //         res.render("list", { listTitle: "Today", NewListItems: itemsarray }); // through this line express is going to look in the folder views and then list.ejs file
  //     }
  // });
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundlist) {
    // foundList here is an single object
    if (!err) {
      if (!foundlist) {
        // console.log("Doesn't exist");
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultArray,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Exists!");
        //Show an existing list
        res.render("list", {
          listTitle: foundlist.name,
          NewListItems: foundlist.items,
        });
      }
    }
  });
});

app.post("/today", (req, res) => {
  console.log(req.body);
  let newitem = req.body.NewItem;
  let listName = req.body.list;
  const newitemdocument = new Item({
    name: newitem,
  });
  if (listName === day) {
    newitemdocument.save();
    res.redirect("/today");
  } else {
    List.findOne({ name: listName }, function (err, foundlist) {
      foundlist.items.push(newitemdocument);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }

  // if(req.body.list==="Work List"){
  //     workItems.push(item);
  //     res.redirect("/work");
  // }else{
  //     items.push(item);
  //     res.redirect("/");
  // }
});
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.cb.substring(1);
  const listName = req.body.listName;
  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("deleted successfully");
      }
    });
    res.redirect("/today");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    ); // parameters are 1) name of the list in which we want to do modifications 2) update 3) Callback
  }
  // console.log(checkedItemId);
});
// app.get("/work",function(req,res){
//     res.render("list",{listTitle:"Work List",NewListItems:workItems})
// });
// // app.post("/",(req,res)=>{
// //     let item = req.body.NewItem;
// //     workItems.push(item);
// //     res.redirect("/");
// // })
app.listen(process.env.PORT || 3000, () =>
  console.log("Server is listening to port 3000")
);
