"use strict";

let path = require('path');
let express = require('express');
let app = express();
const cors = require('cors');

// 
app.use(cors());

// Routing for Admin
const shopRouter = require('../public/routes/shops.js')
const mechanicRouter = require('../public/routes/mechanics.js')

let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

//EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname.slice(0, (__dirname.length - 4)), "ejs-views"));


/***********************************************
 **Database: Schema/Model creation & connection**
 ************************************************/
let mongoose = require('mongoose');

// dB Models
const shopModel = require('../public/models/Shop');
const mechModel = require('../public/models/Mechanic');
const workOrderModel = require('../public/models/WorkOrder');

mongoose.connect('mongodb://localhost:27017/KioskDB');
//****End of dB*********************

// ************************ ADMIN ******************************** //

app.get('/reporting', async (req, res) => {

    try{
        
        let dBData = [];
        
        let mechanics = await mechModel.find({});
        dBData.push(mechanics);

        let shops = await shopModel.find({});
        dBData.push(shops);

        let workOrders = await workOrderModel.find({});
        dBData.push(workOrders);

        res.send(dBData);
    } catch (err) {
        return res.status(500).send(err);
    }
}); 


// ******************* MECHANICS ADMINISTRATION *************************

// Edit work orders
app.put('/editWorkorder', (req, res) => {

    let name = req.body.name;
    let pri = req.body.pri;
    let WOid = req.body.id;

    mechModel.findOne({ mechanicName : name }, function(err, mechs) {
        if (err) {
            console.log(err);
        } else {
            
            if (name !== 'Mechanic') {
                workOrderModel.update({ _id: WOid }, { mechanicID: mechs._id }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.end();
                    }
                });
            }
            if (pri !== 'Priority') {
                workOrderModel.update({ _id: WOid }, { pri: pri }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.end();
                    }
                });
            }
        }
    });

});

/***********************************************************
 ** Look Up Objects: To prevent constant syncronized calls,**
 ** we're keeping a couple in-memory representations with  **
 ** Node.js of the documents in the shop & mech collections,*
 ** refresh-able with RefreshLookUp()(btw:allowing type    **
 ** conversion here with '=='                              **
 ************************************************************/
let SHOPS = {}
let MECHANICS = {}

// 'Refresh' these Node-side objects
function RefreshLookUp() {
    mechModel.find(function(err, mech) {
        MECHANICS = mech;
    });

    shopModel.find(function(err, shop) {
        SHOPS = shop;
    });
}
RefreshLookUp();

// Perform name->id look up
function LookUp(object, name) {
    let id;

    if (object === 'MECHANICS') {
        MECHANICS.forEach(function(i) {
            if (i.mechanicName == name) { id = i._id; }
        });
    } else if (object === 'SHOPS') {
        SHOPS.forEach(function(i) {
            if (i.shopName == name) { id = i._id; }
        });
    }
    return id;
}

// Perform id->name look up
function RevLookUp(object, id) {
    let name;

    if (object === 'MECHANICS') {
        MECHANICS.forEach(function(i) {
            if (i._id == id) { name = i.mechanicName; }
        });
    } else if (object === 'SHOPS') {
        SHOPS.forEach(function(i) {
            if (i._id == id) { name = i.shopName; }
        });
    }
    return name;
}
//Testing setTimeout(()=>{console.log(RevLookUp('SHOPS','5ac40382ad8b772d9c2980fb'));},1000);
//**********************************************************


// Get & set path to static files
let staticPath = path.join(__dirname.slice(0, (__dirname.length - 4)), "public");
app.use(express.static(staticPath));

app.set('port', process.env.PORT || 3000);

// Middleware example
app.use(function(req, res, next) {
    //console.log('request for ' + req.url);
    next();
});

// Populating selectmenus
app.get('/selectmenus', function(req, res) {
    let shopNames = [],
        mechNames = [],
        final = [];

    (() => {
        RefreshLookUp();

        SHOPS.forEach(function(shop) {
            shopNames.push(shop.shopName);
        });

        MECHANICS.forEach(function(mech) {
            mechNames.push(mech.mechanicName);
        });
    })();

    final.push(shopNames);
    final.push(mechNames);
    //console.log(final);
    res.send(final);
    res.end();
});

// With static defined this is bypassed
app.get('/', function(req, res) {
    //res.sendFile('public/index.html');
});

// Add a New Record
app.post('/new_record', function(req, res) {

    // Create & save a new record
    let newRecord = new workOrderModel({
        //mechanicID:	populated with LookUp
        //shopID:		populated with LookUp
        pri: req.body.pri,
        dateOpened: req.body.dateOpened,
        workTodo: req.body.Desc,
        woID: req.body.woID
    })

    newRecord.shopID = LookUp('SHOPS', req.body.shop);
    newRecord.mechanicID = LookUp('MECHANICS', req.body.mech);

    newRecord.save();
    res.send("here"); //remove later
    res.end();
});

// Search for Edit Records
app.get('/search', function(req, res) {

    let query = workOrderModel.find().lean();
    if (req.query.woID !== '') {
        query.where('woID').eq(req.query.woID);
    } else if (req.query.shop !== 'Shop' && req.query.mech !== 'Mechanic') {
        query.where('shopID').eq(LookUp('SHOPS', req.query.shop))
            .where('mechanicID').eq(LookUp('MECHANICS', req.query.mech));
    } else if (req.query.shop !== 'Shop' && req.query.mech === 'Mechanic') {
        query.where('shopID').eq(LookUp('SHOPS', req.query.shop));
    } else if (req.query.shop === 'Shop' && req.query.mech !== 'Mechanic') {
        query.where('mechanicID').eq(LookUp('MECHANICS', req.query.mech));
    }

    query.exec(function(err, results) {
        // Filter on 'workDone'
        let resultsFiltered = results.filter((i) => { if (!i.workDone) { return true; } });

        // RevLookUp: So the client can use a friendly 'name'
        resultsFiltered.forEach((i) => {
            i.mechName = RevLookUp('MECHANICS', String(i.mechanicID));
            i.shopName = RevLookUp('SHOPS', String(i.shopID));
        });
        //console.log(resultsFiltered);
        res.render("editRecordResults", { data: resultsFiltered, appTitle: 'Edit Workorder Results' });
        res.end();
    });
});

// Save an edited record
app.post('/saveEditRecord', function(req, res) {

    workOrderModel.update({ "_id": req.body.rec_id }, { "workDone": req.body.workDone },
        (err) => { if (err) { console.log(err); } });

    res.send("here");
    res.end();
});

// Get priority counts
app.get('/getCounts', (req, res) => {
    let results = {
        pri1: '',
        pri2: '',
        pri3: '',
        pri4: ''
    }

    workOrderModel.find({ 'pri': '1', 'workDone': null }, (err, data) => {
        results.pri1 = JSON.stringify(data.length);
        (() => {
            workOrderModel.find({ 'pri': '2', 'workDone': null }, (err, data) => {
                results.pri2 = JSON.stringify(data.length);
                (() => {
                    workOrderModel.find({ 'pri': '3', 'workDone': null }, (err, data) => {
                        results.pri3 = JSON.stringify(data.length);
                        (() => {
                            workOrderModel.find({ 'pri': '4', 'workDone': null }, (err, data) => {
                                results.pri4 = JSON.stringify(data.length);
                                //console.log(results);
                                res.send(results);
                                res.end();
                            });
                        })();
                    });
                })();
            });
        })();
    });
});

// Routing for Shops Admin
app.use('/admin', shopRouter)
app.use('/admin', mechanicRouter)


// 500 page
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.send('500 - Server Error');
});

// 404 page
app.use(function(req, res) {
    res.status(404);
    res.send('404 - Not Found');
});

const port = 3000;

//Start the server
app.listen(port, function() {
    console.log(`Express started on http://localhost: ${port}; press Ctrl-C to terminate.` );
    let logTime = new Date(Date.now()).toUTCString();
    console.log(logTime);
});