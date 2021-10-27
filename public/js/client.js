"use strict";

// Set jQuery UI Objects
$("#kiosk-accordion").accordion();
$(".kiosk-selectmenu").selectmenu();
$("#date-opened").datepicker({ inline: true });
$("#AE-button-open").button();
$("#AE-button-closed").button();

//
$("#date-openedBefore-reporting").datepicker({ inline: true });
$("#date-openedAfter-reporting").datepicker({ inline: true });

// Init
$(document).ready(() => {

    // Initial UI state
    ChangeState(AppStates.main),

        // Set default for active/inactive button
        $("#AE-button-open").button("disable"),
        $("#AE-button-closed").button("enable"),
        $("#AE-save").hide(),
        $("#edit-work-order").hide();
});

function BuildGreeting() {

    // Get count(s), run the 'bar' automation
    $.ajax({ url: '/getCounts', type: 'get' })
        .done(function(data, xhr) {

            // Set bars to 0
            $('#bar-open').css({ 'width': '0' });
            $('#bar-open-p1').css({ 'width': '0' });
            $('#bar-open-p2').css({ 'width': '0' });
            $('#bar-open-p3').css({ 'width': '0' });
            $('#bar-open-p4').css({ 'width': '0' });

            // Total of all open workorders
            let sum = (Number(data.pri1) + Number(data.pri2) + Number(data.pri3) + Number(data.pri4));

            // Bar 1-4 rollout & fadeIn the count
            $('#bar-open').animate({ 'width': sum * 50 }, 4000);
            $('#open-val').text(Number(sum));
            $('#open-val').hide();
            $('#open-val').fadeIn(4500);

            $('#bar-open-p1').animate({ 'width': Number(data.pri1) * 50 }, 4000);
            $('#p1-val').text(Number(data.pri1));
            $('#p1-val').hide();
            $('#p1-val').fadeIn(4500);

            $('#bar-open-p2').animate({ 'width': Number(data.pri2) * 50 }, 4000);
            $('#p2-val').text(Number(data.pri2));
            $('#p2-val').hide();
            $('#p2-val').fadeIn(4500);

            $('#bar-open-p3').animate({ 'width': Number(data.pri3) * 50 }, 4000);
            $('#p3-val').text(Number(data.pri3));
            $('#p3-val').hide();
            $('#p3-val').fadeIn(4500);

            $('#bar-open-p4').animate({ 'width': Number(data.pri4) * 50 }, 4000);
            $('#p4-val').text(Number(data.pri4));
            $('#p4-val').hide();
            $('#p4-val').fadeIn(4500);

        })
        .fail(function(data, xhr, error) {
            console.log("fail " + 'xhr status:' + xhr.status + ' error:' + error);
        })
}

/************************
 ***UI STATE MANAGEMENT***
 *************************/

// State Object
let AppStates = {
    main: "#greeting",
    newOrder: "#NewWorkorder",
    editOrder: "#Edit-existing",
    editOrderActive: "#Edit-existing-active",
    searchWO: "#searchWO",
    shopsAdmin: "#ShopsAdmin",
    mechsAdmin: "#MechsAdmin",
    reporting: "#reporting"
};

// Transition Function
function ChangeState(state) {
    let tagID;
    for (let i in AppStates) {
        tagID = eval(`AppStates.${i}`);

        if (tagID === state) {
            $(tagID).show();
        } else { $(tagID).hide(); }
    }
    if (state === `#greeting`) { BuildGreeting(); }
}

// Transition Events
$("#button-edit").click(() => {
    ChangeState(AppStates.editOrder)
});

$("#button-new").click(() => {
    ChangeState(AppStates.newOrder)
});

$("#logo-img").click(() => {
    ChangeState(AppStates.main)
});

$("#search-button").click(() => {
    ChangeState(AppStates.searchWO)
});

$("#showShopAdminBtn").click(() => {
    ChangeState(AppStates.shopsAdmin)
});

$("#showMechAdminBtn").click(() => {
    ChangeState(AppStates.mechsAdmin)
});

$("#reporting-button").click(() => {
    ChangeState(AppStates.reporting)
});

//******************

// Edit existing workorder
$("#search-workorder-edit").click(() => {

    let searchRecord = {
        mech: $('#mechanic-selectmenu-edit').val(),
        shop: $('#shop-selectmenu-edit').val(),
        woID: $('#WOid-input').val()
    };

    // Reset
    $('#WOid-input').val('');

    // Get record(s)
    $.ajax({ url: '/search', data: searchRecord, type: 'get' })
        .done(function(data, xhr) {
            $('#edit-records-resultset').replaceWith(data);
            $('.record-widget').hide().slideDown(3000, 'linear');
        })
        .fail(function(data, xhr, error) {
            console.log("fail " + 'xhr status:' + xhr.status + ' error:' + error);
        })

});

// Save New Workorder
$("#save-workorder").click(() => {

    let newRecord = {
        mech: $("#mechanic-selectmenu-new").val(),
        shop: $("#shop-selectmenu-new").val(),
        pri: $("#priority-selectmenu-new").val(),
        dateOpened: $('#date-opened').val(),
        Desc: $('#workorder-text-new').val(),
        woID: $('#WOid-input-new').val()
    };

    // Validate data
    if (newRecord.mech === 'Mechanic' ||
        newRecord.shop === 'Shop' ||
        newRecord.pri === 'Priority') {
        alert('Need to select fields!!!');
    } else {

        // Reset UI (need to reset selectmenus)
        $("#workorder-text-new").val('');
        $("#WOid-input-new").val('');

        // Send the record
        $.ajax({ url: '/new_record', data: newRecord, type: 'post' })
            .done(function(data, xhr) {
                alert('saved!');
                ChangeState(AppStates.main);
            })
            .fail(function(data, xhr, error) {
                console.log("fail " + 'xhr status:' + xhr.status + ' error:' + error);
            })
    }

});


document.getElementById('save-editWorkOrder-btn').addEventListener('click', editWorkorder);


function editWorkorder() {
    
    let name = $('#edit-mechanic-name-selectmenu').val()
    let id = $('#AE-recID').text()
    let pri = $('#work-order-selectmenu-edit').val()
   
    // Update priority/mech name in dD
    $.ajax({
        url: "/editWorkorder",
        type: "put",
        data: {
            name : name,
            pri : pri,
            id : id
        }
    }).done((data, xhr) => {
        ChangeState(AppStates.main);
        $('#edit-records-resultset').empty();
        
    }).fail((err) => {
        console.log(err);
    })
}

// When user clicks on a WO for editing
function GetEditWO(rec_id, pri, woID, shopName, mechName, dateOpened, workToDo) {

    ChangeState(AppStates.editOrderActive);

    $("#AE-mechName").text(mechName);
    $("#AE-shopName").text(shopName);
    $("#AE-pri").text(pri);
    $("#AE-woID").text(woID);
    $("#AE-dateOpened").text(dateOpened);
    $("#AE-workToDo").text(workToDo);
    $("#AE-recID").text(rec_id);
}



// Toggle Open/Closed buttons for 'edit'
$("#AE-button-closed").click(() => {
    $("#AE-button-open").button("enable");
    $("#AE-button-closed").button("disable");
    $("#AE-save").show();
    $('#edit-work-order').hide();
    
});

$("#AE-button-open").click(() => {
    $("#AE-button-open").button("disable");
    $("#AE-button-closed").button("enable");
    $("#AE-save").hide();
    $('#edit-work-order').hide();
});

// Save an edited record (workDone)
$("#AE-button-save").click(() => {

    let updateRecord = {
        rec_id: $('#AE-recID').text(),
        workDone: $('#workorder-text-edit').val()
    };

    // Send the record
    $.ajax({ url: '/saveEditRecord', data: updateRecord, type: 'post' })
        .done(function(data, xhr) {
            alert('saved!');
        })
        .fail(function(data, xhr, error) {
            console.log("fail " + 'xhr status:' + xhr.status + ' error:' + error);
        });

    // Clean up UI
    $('#workorder-text-edit').val('');
    $("#AE-save").hide();
    ChangeState(AppStates.main);
    $('#edit-records-resultset').replaceWith('<div id="edit-records-resultset"></div>');
    $("#AE-button-open").button("disable");
    $("#AE-button-closed").button("enable");
});

// ########################### ADMIN ################################

// jQuery UI widgets
$('.btn').button();
$('.btnset').buttonset();
$("#shopStatus").selectmenu();
$("#mechStatus").selectmenu();


// Hide admin divs in init
$('#ShopsAdmin').hide();
$('#MechsAdmin').hide();
$('#nonActiveShopsList').hide();
$('#nonActiveMechsList').hide();
$('#editShopNameDiv').hide();
$('#editMechNameDiv').hide();

// Toggle Admin List Btns in Admin UI
$('#activeShopBtn').click(() => {
    $('#activeShopsList').hide().slideDown("slow");
    $('#nonActiveShopsList').hide();
});

$('#nonActiveShopBtn').click(() => {
    $('#nonActiveShopsList').hide().slideDown("slow");
    $('#activeShopsList').hide();
});

$('#activeMechBtn').click(() => {
    $('#activeMechsList').hide().slideDown("slow");
    $('#nonActiveMechsList').hide();
});

$('#nonActiveMechBtn').click(() => {
    $('#nonActiveMechsList').hide().slideDown("slow");
    $('#activeMechsList').hide();
});

// Reset Admin UI state
function UIreset() {
    $('#ShopsAdmin').hide();
    $('#MechsAdmin').hide();
    $('#editShopNameDiv').hide();
    $('#editMechNameDiv').hide();

    $('#shopName').val('');
    $('#shopsList').empty();

    $('#mechName').val('');
    $('#mechsList').empty();
}

function showWoEdit() {
    $('#edit-work-order').toggle();
    $('#AE-save').hide();
}

function populateShopsSM() {

    $('#shop-selectmenu-new').empty();
    $('#shop-selectmenu-new').selectmenu("destroy");
    $('#shop-selectmenu-new').selectmenu();
    $(`<option>Shop</option>`).appendTo($('#shop-selectmenu-new'));

    $('#shop-selectmenu-edit').empty();
    $('#shop-selectmenu-edit').selectmenu("destroy");
    $('#shop-selectmenu-edit').selectmenu();
    $(`<option>Shop</option>`).appendTo($('#shop-selectmenu-edit'));
    
    $('#shop-selectmenu-edit-name').empty();
    $('#shop-selectmenu-edit-name').selectmenu("destroy");
    $('#shop-selectmenu-edit-name').selectmenu();
    $(`<option>Shop</option>`).appendTo($('#shop-selectmenu-edit-name'));

    $.ajax({
        url: '/admin/shops-selectmenu',
        type: 'get'
    }).done(function(shops, xhr) {
        shops.forEach(function(shop) {
            $('<option>' + shop.shopName + '</option>').appendTo($('#shop-selectmenu-edit'));
            $('<option>' + shop.shopName + '</option>').appendTo($('#shop-selectmenu-edit-name'));
            if (shop.active == true) {
                $('<option>' + shop.shopName + '</option>').appendTo($('#shop-selectmenu-new'));
            }
        });
        $('#shop-selectmenu-new').selectmenu("refresh");
        $('#shop-selectmenu-edit').selectmenu("refresh");
        $('#shop-selectmenu-edit-name').selectmenu("refresh");

        $('#work-order-selectmenu-edit').empty();
        $('#work-order-selectmenu-edit').selectmenu('destroy');
        $('#work-order-selectmenu-edit').selectmenu();
        $('#work-order-selectmenu-edit').append(`<option>Priority</option>
                                                <option>1</option>
                                                <option>2</option>
                                                <option>3</option>
                                                <option>4</option>`);
        $('#work-order-selectmenu-edit').selectmenu("refresh");

    }).fail(function(shops, xhr, err) {
        console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
    });
}

// Load Shop admin UI & populate Shops List
function showShopAdmin() {

    $('#ShopsAdmin').hide().toggle("drop", { direction: "right" });
    $('#nonActiveShopsList').hide();
    $('#activeShopsList').show();
    $('#editShopNameDiv').hide();

    $.ajax({
        url: '/admin/shops',
        type: 'get'
    }).done(function(shops, xhr) {
        $('#activeShopsList').empty();
        $('#nonActiveShopsList').empty();

        shops.forEach(function(shop) {
            if (shop.active == true) {
                $('#activeShopsList').append('<li>' + shop.shopName + '</li>');
            } else if (shop.active != true) {
                $('#nonActiveShopsList').append('<li>' + shop.shopName + '</li>');
            }
        });
    }).fail(function(shops, xhr, err) {
        console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
    });
}

// Post data to shops lists
$('#saveShopBtn').click(() => {

    let shopName = $('#shopName').val();

    if (shopName == '') {
        alert("ERROR: Must enter a name in field!");

    } else {
        $.ajax({
            type: 'post',
            url: '/admin/save_shop',
            data: {
                shopName: $('#shopName').val(),
                shopStatus: $('#shopStatus').val()
            }
        }).done(function(items,xhr, message) {
            alert(message.responseText);
            UIreset();
            ChangeState(AppStates.main);
        }).fail(function(shops, xhr, err) {
            console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
        });
    }
});

// Delete Shop from dB
$('#deleteShopBtn').click(() => {

    let shopName = $('#shop-selectmenu-edit-name').val();

    if (shopName == 'Shop') {
        alert("ERROR: Must enter a name in field!");
    } else {
        let confirmation = confirm("Are you sure you Want to delete this Shop?");

        if (confirmation) {
            $.ajax({
                url: '/admin/delete_shop',
                type: 'post',
                data: {
                    shopName: shopName
                }
            }).done(function(data, xhr) {
                alert(shopName + " deleted")
                UIreset();
                ChangeState(AppStates.main);
                $('#shopName').toggle("slide", { direction: "up" });
                $('#saveShopBtn').toggle("slide", { direction: "up" });
            }).fail(function(data, xhr, err) {
                console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
            });
        } else {
            return false;
        }
    }
});

// Edit Shop in dB
$('#editShopBtn').click(() => {

    let shopName = $('#shop-selectmenu-edit-name').val();
    let newShopName = $('#editShopName').val();
    let shopStatus = $('#shopStatus').val();

    if (shopName == 'Shop') {
        alert("ERROR: Must enter a name in field!");
    } else {
        let confirmation = confirm("Are you sure you want to update this Shop?");

        if (confirmation) {
            $.ajax({
                url: '/admin/update_shop',
                type: 'put',
                data: {
                    shopName: shopName,
                    shopStatus: shopStatus,
                    editShopName: newShopName
                }
            }).done(function(data, xhr) {
                UIreset();
                ChangeState(AppStates.main);
                $('#shopName').show();
                $('#saveShopBtn').show();
            }).fail(function(data, xhr, err) {
                console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
            });
        } else {
            return false;
        }
    }
});

// Cancel Shop Admin Session & Reset Shop UI
$('#cancelShopBtn').click(() => {
    UIreset();
    ChangeState(AppStates.main);
});

// UI toggle for edit Shop Name text input
$('#activeShopsList').click(() => {
    $('#editShopNameDiv').toggle("slide", { direction: "right" });
    $('#editShopName').val('');
    $('#shopName').toggle("slide", { direction: "up" });
    $('#saveShopBtn').toggle("slide", { direction: "up" });
});


$('#nonActiveShopsList').click(() => {
    $('#editShopNameDiv').toggle("slide", { direction: "right" });
    $('#editShopName').val('');
    $('#shopName').toggle("slide", { direction: "up" });
    $('#saveShopBtn').toggle("slide", { direction: "up" });
});

function populateMechanicsSM() {

    // Reset select menus
    $('#mechanic-selectmenu-new').empty();
    $('#mechanic-selectmenu-new').selectmenu("destroy");
    $('#mechanic-selectmenu-new').selectmenu();
    $(`<option>Mechanic</option>`).appendTo($('#mechanic-selectmenu-new'));

    $('#mechanic-selectmenu-edit').empty();
    $('#mechanic-selectmenu-edit').selectmenu("destroy");
    $('#mechanic-selectmenu-edit').selectmenu();
    $(`<option>Mechanic</option>`).appendTo($('#mechanic-selectmenu-edit'));

    $('#edit-mechanic-name-selectmenu').empty();
    $('#edit-mechanic-name-selectmenu').selectmenu("destroy");
    $('#edit-mechanic-name-selectmenu').selectmenu();
    $(`<option>Mechanic</option>`).appendTo($('#edit-mechanic-name-selectmenu'));
    
    $('#mechanic-selectmenu-edit-name').empty();
    $('#mechanic-selectmenu-edit-name').selectmenu("destroy");
    $('#mechanic-selectmenu-edit-name').selectmenu();
    $(`<option>Mechanic</option>`).appendTo($('#mechanic-selectmenu-edit-name'));

    $.ajax({
        url: '/admin/mechs-selectmenu',
        type: 'get'
    }).done(function(mechs, xhr) {

        mechs.forEach(function(mech) {
            $('<option>' + mech.mechanicName + '</option>').appendTo($('#mechanic-selectmenu-edit'));
            $(`<option> ${mech.mechanicName} </option>`).appendTo($('#mechanic-selectmenu-edit-name'));
            if (mech.active == true) {
                $('<option>' + mech.mechanicName + '</option>').appendTo($('#mechanic-selectmenu-new'));
                $('<option>' + mech.mechanicName + '</option>').appendTo($('#edit-mechanic-name-selectmenu'));
            }
        });

        $('#edit-mechanic-name-selectmenu').selectmenu("refresh");
        $('#mechanic-selectmenu-new').selectmenu("refresh");
        $('#mechanic-selectmenu-edit').selectmenu("refresh");
        $('#mechanic-selectmenu-edit-name').selectmenu("refresh");
    }).fail(function(mechs, xhr, err) {
        console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
    });
}



// Load Mechanics Admin UI & populate Mechanics Lists
function showMechAdmin() {

    $('#MechsAdmin').hide().toggle("drop", { direction: "right" });
    $('#activeMechsList').show();
    $('#nonActiveMechsList').hide();

    $.ajax({
        url: '/admin/list_mechs',
        type: 'get'
    }).done(function(mechs, xhr) {

        $('#activeMechsList').empty();
        $('#nonActiveMechsList').empty();

        mechs.forEach(function(mech) {
            if (mech.active == true) {
                $('#activeMechsList').append('<li>' + mech.mechanicName + '</li>');
            } else if (mech.active != true) {
                $('#nonActiveMechsList').append('<li>' + mech.mechanicName + '</li>');
            }
        });
    }).fail(function(mechs, xhr, err) {
        console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
    });
}

// Save new Mechanic to dB
$('#saveMechBtn').click(() => {

    let mechanicName = $('#mechName').val();
    if (mechanicName == '') {
        alert("ERROR: Must enter a name in field!");
    } else {
        $.ajax({
            type: 'post',
            url: '/admin/save_mech',
            data: {
                mechanicName: mechanicName,
                mechStatus: $('#mechStatus').val(),
            }
        }).done(function(data, xhr, message) {
            alert(message.responseText);
            UIreset();
            ChangeState(AppStates.main);
        }).fail(function(data, xhr, err) {
            console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
        });
    }
})

// Delete Mechanic from DB
$('#deleteMechBtn').click(() => {

    let mechanicName = $('#mechanic-selectmenu-edit-name').val();

    if (mechanicName == '') {
        alert("ERROR: Must enter a name in field!");
    } else {
        let confirmation =
            confirm("Are you sure you Want to delete this Mechanic?");

        if (confirmation) {
            $.ajax({
                url: '/admin/delete_mech',
                type: 'post',
                data: {
                    mechanicName: mechanicName
                }
            }).done(function(data, xhr) {
                alert(mechanicName + " deleted");
                UIreset();
                ChangeState(AppStates.main);
                 $('#mechName').show();
                $('#saveMechBtn').show();
            }).fail(function(data, xhr, err) {
                console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
            });
        } else {
            return false;
        }
    }
});

// Update Mechanic in dB
$('#editMechBtn').click(() => {

    let mechanicName = $('#mechanic-selectmenu-edit-name').val();
    let editMechName = $('#editMechName').val();
    let mechStatus = $('#mechStatus').val()

    if (mechanicName === 'Mechanic') {
        alert("ERROR: Must enter a name in field!");
        
    } else {

        let confirmation = confirm("Are you sure you want to update this Mechanic?");

        if (confirmation) {
            $.ajax({
                url: '/admin/update_mech',
                type: 'put',
                data: {
                    mechanicName: mechanicName,
                    mechStatus: mechStatus,
                    editMechName: editMechName
                }
            }).done(function(data, xhr) {
                alert($('#mechName').val() + " Updated")
                UIreset();
                $('#mechName').show();
                $('#saveMechBtn').show();
                ChangeState(AppStates.main);
            }).fail(function(data, xhr, err) {
                console.log("fail " + 'xhr status:' + xhr.status + ' error:' + err);
            });
        } else {
            return false;
        }
    }
});

// Cancel mechanic Admin button
$('#cancelMechBtn').click(() => {
    UIreset();
    ChangeState(AppStates.main);
});

// UI toggle for edit Mechanic Name text input
$('#activeMechsList').click(() => {
    $('#editMechNameDiv').toggle("slide", { direction: "right" });
    $('#editMechName').val('');
    $('#mechName').toggle("slide", { direction: "up" });
    $('#saveMechBtn').toggle("slide", { direction: "up" });
});

$('#nonActiveMechsList').click(() => {
    $('#editMechNameDiv').toggle("slide", { direction: "right" });
    $('#editMechName').val('');
    $('#mechName').toggle("slide", { direction: "up" });
    $('#saveMechBtn').toggle("slide", { direction: "up" });
});

// ##################### Still under development ##############


// Reporting 
// $('#reporting-button').click(() => {
// function reporting (){    
//     $.ajax({
//         type: 'get',
//         url: '/reporting'
//     }).done(function(data, xhr) {
//         //alert('Reporting');
//         console.log(data);
//     }).fail(function(data, xhr, err) {
//         console.error(err);
//     });
// // });
// }
// Populate edit workorders mechanic selectmenus
document.getElementById('button-edit').addEventListener('click', populateMechanicsSM);

// Populates the New/Edit Workorder mechanic selectmenus
document.getElementById('button-new').addEventListener('click', populateMechanicsSM);

// popluate edit work order shop selectmenu
document.getElementById('button-edit').addEventListener('click', populateShopsSM);
document.getElementById('activeShopsList').addEventListener('click', populateShopsSM);
document.getElementById('nonActiveShopsList').addEventListener('click', populateShopsSM);

// Populates the New/Edit Workorder shop selectmenus
document.getElementById('button-new').addEventListener('click', populateShopsSM);

// edit work order busy spot
document.getElementById('AE-button-edit').addEventListener('click', showWoEdit)
document.getElementById('button-edit').addEventListener('click', populateMechanicsSM)

document.getElementById('showMechAdminBtn').addEventListener('click', showMechAdmin);

document.getElementById('showShopAdminBtn').addEventListener('click', showShopAdmin);

// document.getElementById('editMechNameBtn').addEventListener('click', populateMechanicsSM );
document.getElementById('activeMechsList').addEventListener('click', populateMechanicsSM );


// ################### REPORTING INTEGRATION ###################

$( "#files" ).selectmenu();