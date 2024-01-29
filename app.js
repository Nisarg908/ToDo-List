const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// let items = ["Complete GATE PYQs"];
// let workItems = ["Complete your todo list"];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

// Event handler for successful connection
db.on('connected', () => {
  console.log('Connected to MongoDB successfully!');
});

// Event handler for connection errors
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
//Defining Schema
const itemSchema = {
    name: String
};
//collection name items
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name: "Welcome to your todo list!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];


app.get("/", (req,res) => {
    // let today = new Date();

    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // // let currentDay = today.getDay();
    // let day = today.toLocaleDateString("en-US", options);
    
    // if(currentDay === 6 || currentDay === 0) {
    //     day = "Weekend";
    // } else {
    //     day = "Weekday";
    // }
    // switch(currentDay) {
    //     case 0:
    //         day = "Sunday";
    //         break;
    //     case 1:
    //         day = "Monday";
    //         break;
    //     case 2:
    //         day = "Tuesday";
    //         break;
    //     case 3:
    //         day = "Wednesday";
    //         break;
    //     case 4:
    //         day = "Thursday";
    //         break;
    //     case 5:
    //         day = "Friday";
    //         break;
    //     case 6:
    //         day = "Saturday";
    //         break;
    //     default:
    //         day = "Error fetching date!!"
    // }
    let day = date.getDate();
    async function insertDefaultItems() {
        try {
            await Item.find()
                .then((data) => {
                    if(data.length === 0) {
                        Item.insertMany(defaultItems);
                        console.log("Successfully saved default items to DB.");
                        res.redirect("/");
                    } else{
                        res.render("list", {listTitle: day, newListItems: data});
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        } catch (err) {
            console.error(err);
        }
    }
    
    insertDefaultItems();
    // Item.find()
    //     .then((data) => {
    //         res.render("list", {listTitle: day, newListItems: data});
    //     })
    //     .catch((err) => {
    //         console.log(err);
    //     });
});
const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customListName", (req,res) => {
    console.log(req.params.customListName);
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
        .then((data) => {
            if(!data) {
                console.log("Doesn't exist !");
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                
                list.save();
                res.render("list", {listTitle: list.name, newListItems: list.items});
            } else {
                console.log("Exists");
                res.render("list", {listTitle: data.name, newListItems: data.items});
            }
        })
        .catch((err) => {
            console.log(err);
        });
    
});

app.post("/", (req,res) => {

    // if(req.body.submitButton === 'Work List') {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
        const itemName = req.body.newItem;
        const listName = req.body.submitButton;
        console.log("List Name: "+listName)
        const item = new Item({
            name: itemName
        });

        if(listName === date.getDate()) {
            item.save();
            console.log("Successfully saved default items to DB.");
            res.redirect("/");
        } else {
            List.findOne({name: listName})
                .then((data) => {
                    data.items.push(item);
                    data.save();
                    res.redirect("/"+listName);
                })
                .catch((err) => {
                    console.log("Error list fetch and routing on new list"+err)
                });
        }
});

app.post("/delete", (req,res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()) {
        Item.findByIdAndDelete(checkedItemId)
            .then(() => {
                console.log("Successfully deleted the item.");
            })
            .catch((err)=> {
                console.log("Error deleting the item: \n"+err);
            });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
            .then((data) => {
                res.redirect("/"+listName);
            })
            .catch((err) => {
                console.log("ERROR:\n"+err)
            });
    }
    
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
})