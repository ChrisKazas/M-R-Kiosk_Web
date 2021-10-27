shops.forEach(function(shop){
	if (shop.active == true) {
		$('#activeShopsList').append('<li>' + shop.shopName + '</li>');
	}else if(shop.active != true){
		$('#nonActiveShopsList').append('<li>' + shop.shopName + '</li>');
	}
});

$('#shop-selectmenu-edit').empty();

$('#shop-selectmenu-new').append(`<option>${data[0][i]}</option>`);
$('#shop-selectmenu-edit').append(`<option>${data[0][i]}</option>`);
$('#mechanic-selectmenu-new').append(`<option>${data[1][i]}</option>`);
$('#mechanic-selectmenu-edit').append(`<option>${data[1][i]}</option>`);
populateShopsSM();
populateMechanicsSM();

$('#shop-selectmenu-new').empty();
$('#shop-selectmenu-edit').empty();
$('#mechanic-selectmenu-new').empty();
$('#mechanic-selectmenu-edit').empty();
