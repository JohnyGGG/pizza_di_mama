const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-section');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'Our little secret',
    resave: false,
    saveUnitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/pizzadimamaDB', {useNewUrlParser: true});

//TABLE BOOK
const tableBooksSchema = {
    name: String,
    email: String,
    date: Date,
    dateFormated: String,
    numberPeople: Number,
    considerations: String,
    confirmed: Boolean
}

const tableBook = mongoose.model('tableBooks', tableBooksSchema);

//TAKE AWAY ORDER
const takeAwayOrdersSchema = {
    name: String,
    email: String,
    order: Array,
    date: Date,
    hours: String,
    considerations: String
}

const takeAwayOrder = mongoose.model('takeAwayOrders', takeAwayOrdersSchema);

//ORDER HOME
const orderHomeSchema = {
    name: String,
    email: String,
    address: String,
    order: Array,
    date: Date,
    hours: String,
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

//USER
const UserSchema = new mongoose.Schema ({
    email: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', UserSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req,res) => {
    menuItem.find({}, (err, data) => {
        res.render('index', {items: data});
    });
});

app.get('/login', (req,res) => {
    res.render('login');
});

app.post('/login', (req,res) => {

    const username = req.body.username;
    const password = req.body.password;
    var tickets;
    
    User.findOne({email: username}, (err,foundUser) => {
        if(err){
            console.log(err);
        }else{
            if(foundUser) {
                if( foundUser.password === password){
                    tableBook.find({}, (err, data) => {
                        takeAwayOrder.find({}, (err, data2) => {
                            orderHome.find({}, (err, data3) => {
                                res.render('reservations', {tickets: data, takeAway: data2, orderHome: data3});
                            });       
                        });
                    });
                }else{
                    console.log('Wrong Password');
                }
            }else{
                console.log("user doesn't exist");
            }
        }
    });
});

app.post('/register', (req,res) => {
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save((err) => {
        if(err){
            console.log(err);
        }else{
            res.redirect('/');
        }
    });
});

app.get('/register', (req,res) => {
    res.render('register');
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

    const dateFormated = getDateFormated(date);

    const book = new tableBook({
        name: resName,
        email: email,
        date: date,
        dateFormated: dateFormated,
        numberPeople: numberPeople,
        confirmed: false,
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

    var datetime = new Date();

    var hours = getHoursFormated(datetime);
    var orderArray = [];

    var orderList = order.split('|');
    orderList.forEach(elm => {
        var name = elm.split('  x')[0].replace('\r','').replace('\n','');
        var qtd = elm.split('x  ')[1];

        if(name !== null){
            var newOrderItem = {
                name: name,
                qtd:qtd
            }
        }

        orderArray.push(newOrderItem);
    });

    const takeAway = new takeAwayOrder({
        name: resName,
        email: email,
        order: orderArray,
        date: datetime,
        hours: hours,
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

    var orderArray = [];

    var datetime = new Date();

    var hours = getHoursFormated(datetime);

    var orderList = order.split('|');
    orderList.forEach(elm => {
        var name = elm.split('  x')[0].replace('\r','').replace('\n','');
        var qtd = elm.split('x  ')[1];

        if(name !== null){
            var newOrderItem = {
                name: name,
                qtd:qtd
            }
        }

        orderArray.push(newOrderItem);
    });

    const orderHomeOrder = new orderHome({
        name: resName,
        email: email,
        order: orderArray,
        address: address,
        date: datetime,
        hours: hours,
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

app.post('/update-table-book', (req,res) => {
    var id = req.body.id;
    tableBook.findOne({_id:id},(err, foundObject) => {
        if(err){
            console.log(err);
            res.status(500).send();
        }else{
            if(!foundObject){
                res.status(404).send();
            }else{
                foundObject.confirmed = true;
                foundObject.save();
            }
        }
    } );


    /* tableBook.find({}, (err, data) => {
        takeAwayOrder.find({}, (err, data2) => {
            orderHome.find({}, (err, data3) => {
                res.render('reservations', {tickets: data, takeAway: data2, orderHome: data3});
            });       
        });
    }); */

});

const getDateFormated = (data) => {
    var date = new Date(data);
    var dd = date.getDay();
    var mm = date.getMonth() + 1; 
    var h = date.getHours();
    var m = date.getMinutes();
    var yyyy = date.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    } 
    if (mm < 10) {
        mm = '0' + mm;
    } 
    if (h < 10) {
        h = '0' + mm;
    }
    if (m < 10) {
        m = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy + ' ' + h + ':' + m;
}

const getHoursFormated = (data) => {
    var date = new Date(data);

    var h = date.getHours();
    var m = date.getMinutes();

    if (h < 10) {
        h = '0' + mm;
    }
    if (m < 10) {
        m = '0' + mm;
    }
    return h + ':' + m;
}

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

