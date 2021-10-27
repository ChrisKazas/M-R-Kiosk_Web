const express = require('../../srvr/node_modules/express');
const mechanicRouter = express.Router();

// Create a new Mechanic to dB
mechanicRouter.post('/save_mech', function(req, res) {

    let mech = new mechModel();

    mech.mechanicName = req.body.mechanicName;

    if (req.body.mechStatus == "active")
        mech.active = true;
    if (req.body.mechStatus == "Inactive")
        mech.active = false;

    mechModel.findOne({mechanicName : mech.mechanicName},(err, name) => {
        if(!name){
            mech.save(function(err) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    res.send("Mechanic successfully saved!")
                }
            });
        }else{
            res.send("Error: Mechanic already exists")
        }
    })
});

// Read list of mechs to client
mechanicRouter.get('/list_mechs', function(req, res) {

    mechModel.find({}, function(err, mechs) {
        if (err) {
            console.log(err);
        } else {
            res.send(mechs);
        }
    });
});

// Update mechanic status
mechanicRouter.put('/update_mech', function(req, res) {

    let mech = {};
    mech.mechanicName = req.body.mechanicName;
    let mechStatus = req.body.mechStatus;
    let editMechName = req.body.editMechName;

    if (mechStatus == "active")
        mech.active = true;
    if (mechStatus == "Inactive")
        mech.active = false;
    
    mechModel.findOne({ mechanicName: mech.mechanicName }, function(err, mechs) {
        if (err) {
            console.log(err);
        } else {

            if (editMechName === '') {
                mechModel.update({ _id: mechs._id }, { active: mech.active }, function(err) {
                    if (err) {
                        console.log(err);
                    } else {

                        res.end();
                    }
                });
            }

            if (editMechName != '') {
                mechModel.update({ _id: mechs._id }, { mechanicName: editMechName, active: mech.active }, function(err) {
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

// Delete Mecashnic from dB
mechanicRouter.post('/delete_mech', function(req, res) {

    let mechanicName = req.body.mechanicName;

    mechModel.findOne({ mechanicName: mechanicName }, function(err, mechs) {
        if (err) {
            console.log(err);
        } else {
            mechs.remove({ _id: mechs._id });
            res.end();
        }
    });
});

// route for populating new work order select menus
mechanicRouter.get('/mechs-selectmenu', function(req, res) {

    mechModel.find({}, function(err, mechs) {
        if (err) {
            console.log(err);
        } else {
            res.send(mechs);
            res.end();
        }
    });
});

module.exports = mechanicRouter;