const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }))

mongoose.connect('mongodb://localhost:27017/pizzadimamaDB', {useNewUrlParser: true});

//TABLE BOOK
const tableBooksSchema = {
    name: String,
    email: String,
    date: Date,
    numberPeople: Number,
    considerations: String
}

const tableBook = mongoose.model('tableBooks', tableBooksSchema);

//TAKE AWAY ORDER
const takeAwayOrdersSchema = {
    name: String,
    email: String,
    order: Array,
    considerations: String
}

const takeAwayOrder = mongoose.model('takeAwayOrders', takeAwayOrdersSchema);

//ORDER HOME
const orderHomeSchema = {
    name: String,
    email: String,
    address: String,
    order: Array,
    considerations: String
}

const orderHome = mongoose.model('homeOrders', orderHomeSchema);

//MENU

const menuItemsSchema = {
    name: String,
    ingredients: String,
    price: Number
}

const menuItem = mongoose.model('menuItems', menuItemsSchema);



app.get('/', (req,res) => {
    menuItem.find({}, (err, data) => {
        res.render('index', {items: data});
    });
});



app.get('/reservations', (req,res) => {
    var tickets;
    tableBook.find({}, (err, data) => {
        takeAwayOrder.find({}, (err, data2) => {
            orderHome.find({}, (err, data3) => {
                res.render('reservations', {tickets: data, takeAway: data2, orderHome: data3});
            });       
        });
    });
    
});

app.get('/menu/create', (req,res) => {
    res.render('create');
});

app.post('/reservations', (req,res) => {
    const resName = req.body.name;
    const email = req.body.email;
    const date = req.body.date;
    const numberPeople = req.body.numberPeople;
    const considerations = req.body.considerations;

    const book = new tableBook({
        name: resName,
        email: email,
        date: date,
        numberPeople: numberPeople,
        considerations: considerations
    });

    book.save();

    res.redirect('/');
});

app.post('/take-away', (req,res) => {
    const resName = req.body.name;
    const email = req.body.email;
    const order = req.body.order;
    const considerations = req.body.considerations;

    const takeAway = new takeAwayOrder({
        name: resName,
        email: email,
        order: order,
        considerations: considerations
    });

    takeAway.save();

    res.redirect('/');
});

app.post('/order-home', (req,res) => {
    const resName = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const order = req.body.order;
    const considerations = req.body.considerations;

    const orderHomeOrder = new orderHome({
        name: resName,
        email: email,
        order: order,
        address: address,
        considerations: considerations
    });

    orderHomeOrder.save();

    res.redirect('/');
});

app.post('/menu/store', (req,res) => {
    const name = req.body.name;
    const ingredients = req.body.ingredients;
    const price = req.body.price;

    const item = new menuItem({
        name: name,
        ingredients: ingredients,
        price: price
    });

    item.save();

    res.redirect('/');
});

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

