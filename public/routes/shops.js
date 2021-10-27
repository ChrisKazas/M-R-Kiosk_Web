const express = require('../../srvr/node_modules/express');
const shopRouter = express.Router();

// Get request fro shops
shopRouter.get('/shops', function(req, res) {

    shopModel.find({}, function(err, shops) {
        if (err) {
            console.log(err);
        } else {
            res.send(shops);
            res.end();
        }
    });
});

// Save a new shop to dB
shopRouter.post('/save_shop', function(req, res) {

    let shop = new shopModel();

    shop.shopName = req.body.shopName;

    if (req.body.shopStatus == "active")
        shop.active = true;
    if (req.body.shopStatus == "Inactive")
        shop.active = false;

    shopModel.findOne({shopName: shop.shopName},(err, name) => {
        if(!name){
            shop.save(function(err) {
                if (err) {
                    console.log(err);
                    res.end();
                } else {
                    res.send("Location successfully saved!")
                }
            });
        }else{
            res.send("Error: Location already exists")
        }
    })

    
});


// Delete Shop from dB
shopRouter.post('/delete_shop', function(req, res) {

    let shopName = req.body.shopName;

    shopModel.findOne({ shopName: shopName }, function(err, shops) {
        if (err) {
            console.log(err);
        } else {
            shops.remove({ _id: shops._id });
            res.end();
        }
    });
});

// Edit shop in dB
shopRouter.put('/update_shop', function(req, res) {

    // Get user input values from client
    let shop = {};
    shop.shopName = req.body.shopName;
    let shopStatus = req.body.shopStatus;
    let editShopName = req.body.editShopName;

    if (shopStatus == "active")
        shop.active = true;
    if (shopStatus == "Inactive")
        shop.active = false;

    // perform a lookup for name to update shop data         
    shopModel.findOne({ shopName: shop.shopName }, function(err, shops) {
        if (err) {
            console.log(err);
        } else {
            if (editShopName === '')
                shopModel.update({ _id: shops._id }, { active: shop.active }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.end();
                    }
                });

            if (editShopName != '')
                shopModel.update({ _id: shops._id }, { shopName: editShopName, active: shop.active }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.end();
                    }
                });
        }
    });
});


// Send list of shops to client
shopRouter.get('/shops-selectmenu', function(req, res) {

    shopModel.find({}, function(err, shops) {
        if (err) {
            console.log(err);
        } else {
            res.send(shops);
        }
    });
});

module.exports = shopRouter;



