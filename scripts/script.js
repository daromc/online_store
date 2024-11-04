//API images, description and price.
const url = "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
//main variables
let total_ = 0;
let change_ = 1;
let shipping_cost = 0;
let taxes_cost = 0;
let total_cost_with_taxes =0.0;
let country_taxes = "";
let province_taxes = "";
let province_taxes_GSTHST = 0.05;
let province_taxes_PST = 0.0;
let credit_card_val = false;
let expirationDate_val = false;
let credit_card_CVV_val = false;
let fname_val = false;
let lname_val = false;
let postalcode_val = false;
let phonenumber_val = false;
let email_val = false;
let currency_name = "cad";
let country_name = "ca";
let province_name = "bc";
//Function getproducts, create the cards with the images, description and price with the API info
let getproducts = async (change__) => {
  return new Promise(async (resolve) => {
		const response = await fetch(url);
		const data = await response.json();
		//create the new rows adding cards.
		for(i=0 ; i < data.length ; i++){
			let product_id = data[i].id;
			let product_image = data[i].image;
			let product_title = data[i].title;
			let product_description = data[i].description;
			let product_price = data[i].price * change__ ;
			product_price = product_price.toFixed(2);
			$("#products_row").append(`<div class="col">
											<div class="card bg-transparent" >
												<img id="image_product_${product_id}" src="${product_image}" class="card-img-top" alt="don't support bootstrap" >
													<div class="card-body">
														<h5 id="title_product_${product_id}" class="card-title">${product_title}</h5>
														<p id="description_product_${product_id}" class="card-text">${product_description}</p>
														<span><b>$</b></span>
														<span id="price_product_${product_id}" class="card-text mb-3"><b>${product_price}</span>
														<p><button id="button_p${product_id}" class="button-buy btn btn-success mt-3 text-end" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight" data-id="${product_id}" data-title="${product_title}" data-price="${product_price}">Add To Cart</button></p>
													</div>
												</div>
											</div>`);
		}
		resolve();
	});
};
getproducts(change_);

//Calculate total show the total amount before taxes in the shopping cart offcanvas
//Calculate the total in the order detail modal and the shipping cost of 10%.
function calculate_total(){
    $("#canvas_shopping_car_total").html("<b>Total cost is : $"+ total_.toFixed(2)+"</b>");
	$("#order_details_totals_sub").html("<b>$"+ total_.toFixed(2)+"</b>");
	//10% additional to shipping total cost.
	shipping_cost = 0.1 * total_.toFixed(2);
	$("#order_details_totals_shipping").html("<b>$"+ shipping_cost.toFixed(2)+"</b>");
	taxes_cost = (province_taxes_GSTHST * total_.toFixed(2)) + (province_taxes_PST * total_.toFixed(2));
	$("#order_details_totals_tax").html("<b>$"+ taxes_cost.toFixed(2)+"</b>");
	total_cost_with_taxes = parseFloat(total_.toFixed(2)) + parseFloat(shipping_cost) + parseFloat(taxes_cost);
	$("#order_details_totals_total").html("<b>$"+ total_cost_with_taxes.toFixed(2)+"</b>");
}

//Car_clear function, used to clear all the products in the shopping cart offcanvas
function car_clear_(){
	total_ = 0.0;
    $(".newitem").remove();
	$("#canvas_shopping_car_total").html("<b>Total cost is : $"+ total_.toFixed(2)+"</b>");
	//remove the items from the order details modal
	$('.orderdetailsitems').empty();
	$("#order_details_totals_sub").html("<b>$"+ total_.toFixed(2)+"</b>");
	shipping_cost = 0;
	$("#order_details_totals_shipping").html("<b>$"+ shipping_cost.toFixed(2)+"</b>");
	taxes_cost =0;
	$("#order_details_totals_tax").html("<b>$"+ taxes_cost.toFixed(2)+"</b>");
	total_cost_with_taxes = 0;
	$("#order_details_totals_total").html("<b>$"+ total_cost_with_taxes.toFixed(2)+"</b>");
}

//the event click the function delete the selected item from the shopping cart offcanvas
$(document).on('click', '.delete_car_item', function() {
  let id = $(this).data('id');
  let subtotal = $(`#total_${id}`).text();
  total_ = total_ - parseFloat(subtotal);
  calculate_total();
  $(`.newitem_${id}`).remove();
});

let quantity = 1;
//on the click event button-buy add the item to the shopping cart offcanvas
$(document).on("click", ".button-buy", function(){
	let id = $(this).data('id');
	let title = $(this).data('title');
	let price = $(this).data('price');
	total_ = total_ + parseFloat(price);
	calculate_total();
	
	if($(`#title_${id}`).text() == title ) {
		// Item with the same id already exists in the shopping cart it just update the quantity
		let currentQuantity = parseInt($(`#quantity_${id}`).text());
		currentQuantity =  currentQuantity + quantity;
		$(`#quantity_${id}`).text(currentQuantity);
		let currentTotal = parseFloat($(`#price_${id}`).text());
		currentTotal = currentQuantity * price;
		$(`#total_${id}`).text(currentTotal);
	} 
	else{
		// if the Item with the same id does not exist in the shopping cart add the new item
		let the_new_item = `
								<div id="button_${id}" class="col-2 text-center newitem newitem_${id} mb-1"><button id="delete_item" class="delete_car_item newitem newitem_${id}" data-subtotal="${price * quantity}" data-id="${id}">X</button></div>
								<div id="title_${id}" class="col-4 text-center newitem newitem_${id} mb-1">${title}</div>
								<div id="quantity_${id}" class="col-2  text-center newitem newitem_${id} mb-1">${quantity}</div>
								<div id="price_${id}" class="col-2 text-center newitem newitem_${id} mb-1">${price}</div>
								<div id="total_${id}" class="col-2 text-end newitem newitem_${id} mb-1">${price * quantity}</div>								
							`;
		$('#canvas_shopping_car_subtotal').append(the_new_item);
	}
});

//currency change API, get the lastest change from CAD(canadian dollars) to USD(us dollars) and CAD to COP (colombian pesos)
const url_currency_cadusd = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad/usd.json";
const url_currency_cadcop = "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad/cop.json";

//update Products after select the currency, change the price of the products and update the shopping cart
// with the price and total.
 let updateProducts = async (changeValue) => {
	total_ = 0;
  // Clear the existing products
  $("#products_row").empty();
  // Call getproducts with the updated changeValue
  await getproducts(changeValue);
	const element = document.getElementById('canvas_shopping_car_subtotal');
	let numb = element.childNodes.length;
	if (numb > 13){
		const divs_newitem = document.getElementsByClassName("newitem");
		let priceNumbers = [];
		// Initialize a counter to count the price_$id elements
		for (let i = 0; i < divs_newitem.length; i++) {
			let div = divs_newitem[i];
			let id = div.id;
			if (id.startsWith("price_")) {
				//let div_price_id = id.startsWith("price_");
				let priceNumber = parseInt(id.split("_")[1]); // Extract the numeric part from id
				priceNumbers.push(priceNumber);
			}
		}
		for(let j = 0;j < priceNumbers.length; j++){
			let currentPrice = parseFloat($(`#price_product_${priceNumbers[j]}`).text());
			$(`#price_${priceNumbers[j]}`).text(currentPrice);
			let currentQuantity = parseInt($(`#quantity_${priceNumbers[j]}`).text());
			$(`#total_${priceNumbers[j]}`).text(currentPrice * currentQuantity);
			total_ = total_ + parseFloat(currentPrice * currentQuantity);
		}
		calculate_total();
	}
};
 //this event listener change the currency 1 for $CAD, 2 for $USD and 3 for $COP
const selectedCurrency = document.getElementById("selected_currency");
selectedCurrency.addEventListener("change", function() {
	let currencyValue = selectedCurrency.value;
	if (currencyValue === "1") {
      // Update to Canadian Dollars
		currency_name = "cad";
		change_ = 1;
    	setTimeout(async () => {
      		await updateProducts(change_);
    	}, 0);
  	}
	else if (currencyValue === "2") {
		// Update to US Dollars
		currency_name = "usd";
		let getcurrency = async () => {
			const response = await fetch(url_currency_cadusd);
			const data_currency = await response.json();
			change_ = parseFloat(data_currency.usd);
			setTimeout(async () => {
				await updateProducts(change_);
			}, 0);
		};
		getcurrency();
    } 
	else if (currencyValue === "3") {
    	// Update to Colombian Pesos
		currency_name = "cop";
		let getcurrency = async () => {
			const response = await fetch(url_currency_cadcop);
			const data_currency = await response.json();
			change_ = parseFloat(data_currency.cop);
			setTimeout(async () => {
				await updateProducts(change_);
			}, 0);
		};
		getcurrency();
    }
});

//Validation Payment method Credit card , month, year, csv
function ismachingCredictCard(srt){
	let credictCard_regex = /[0-9]{4} {0,1}[0-9]{4} {0,1}[0-9]{4} {0,1}[0-9]{4}/;
	return credictCard_regex.test(srt);
}

function ismachingCredictCard_YY(srt){
	let ismachingCredictCard_YY_regex = /^20[2-9][3-9]|21\d{2}|2099$/;
	return ismachingCredictCard_YY_regex.test(srt);
}
function ismachingCredictCard_CVV(srt){
	let credictCard_CVV_regex = /^\d{3}$/;
	return credictCard_CVV_regex.test(srt);
}

const input_credictCard = document.getElementById("cardNumber");
input_credictCard.addEventListener("input", function (){
	let credictCard_input = $("#cardNumber").val();
	if (ismachingCredictCard(credictCard_input)){
		$("#cardNumber").removeClass("is-invalid");
		$("#cardNumber").addClass("is-valid");
		$("#text_invalid_credit_card").text("");
		credit_card_val = true;
	}
	else{
		$("#cardNumber").removeClass("is-valid");
		$("#cardNumber").addClass("is-invalid");
		$("#text_invalid_credit_card").text("Invalid credit card").css("color", "red");
		credit_card_val = false;
	}
});

const input_credictCard_YY = document.getElementById("expirationDate_yy");
input_credictCard_YY.addEventListener("input", function (){
	let credictCard_YY_input = $("#expirationDate_yy").val();
	let credictCard_MM_input = $("#expirationDate_mm").val();
	if (ismachingCredictCard_YY(credictCard_YY_input)){
		$("#expirationDate_yy").removeClass("is-invalid");
		$("#expirationDate_yy").addClass("is-valid");
		$("#expirationDate_mm").removeClass("is-invalid");
		$("#expirationDate_mm").addClass("is-valid");
		expirationDate_val = true;
		if (credictCard_YY_input == "2023" && parseInt(credictCard_MM_input) < 4 ) {
			$("#expirationDate_yy").removeClass("is-valid");
			$("#expirationDate_yy").addClass("is-invalid");
			$("#expirationDate_mm").removeClass("is-valid");
			$("#expirationDate_mm").addClass("is-invalid");
			expirationDate_val = false;
		}
	}
	else{
		$("#expirationDate_yy").removeClass("is-valid");
		$("#expirationDate_yy").addClass("is-invalid");
		$("#expirationDate_mm").removeClass("is-valid");
		$("#expirationDate_mm").addClass("is-invalid");
		expirationDate_val = false;
	}
});

const input_cardNumber_cvv = document.getElementById("cardNumber_cvv");
input_cardNumber_cvv.addEventListener("input", function (){
	let credictCard_CVV_input = $("#cardNumber_cvv").val();
	if (ismachingCredictCard_CVV(credictCard_CVV_input)){
		$("#cardNumber_cvv").removeClass("is-invalid");
		$("#cardNumber_cvv").addClass("is-valid");
		credit_card_CVV_val = true;
	}
	else{
		$("#cardNumber_cvv").removeClass("is-valid");
		$("#cardNumber_cvv").addClass("is-invalid");
		credit_card_CVV_val = false;
	}
});

// Buttons continue in the modal
$('.btn-continue').on('click', function(event) {
	event.preventDefault();
	// get the next tab pane element
	const nextTabPane = $('.nav-pills .nav-link.active').parent().next().find('.tab-pane');
	// activate the next tab pane
	const nextTabLink = $('.nav-pills .nav-link.active').parent().next().find('.nav-link');
	const tab = new bootstrap.Tab(nextTabLink.get(0));
	tab.show();
});

//Validation Billing details: First_Name, Last_Name, Address, Country, Province, Postal Code, phone number, email.
function ismachingFname(srt){
	let fname_regex = /^[^\s]+$/ ;
	return fname_regex.test(srt);
}
const input_fname = document.getElementById("inputFName");

input_fname.addEventListener("input", function (){
	let fname_input = $("#inputFName").val();
	if (ismachingFname(fname_input)){
		$("#inputFName").removeClass("is-invalid");
		$("#inputFName").addClass("is-valid");
		fname_val = true;
	}
	else{
		$("#inputFName").removeClass("is-valid");
		$("#inputFName").addClass("is-invalid");
		fname_val = false;
	}

});
const input_lname = document.getElementById("inputLName");
input_lname.addEventListener("input", function (){
	let lname_input = $("#inputLName").val();
	if (ismachingFname(lname_input)){
		$("#inputLName").removeClass("is-invalid");
		$("#inputLName").addClass("is-valid");
		lname_val = true;
	}
	else{
		$("#inputLName").removeClass("is-valid");
		$("#inputLName").addClass("is-invalid");
		lname_val = false;
	}
});

const input_postalcode = document.getElementById("inputPostalcode");
input_postalcode.addEventListener("input", function (){
	let postalcode_input = $("#inputPostalcode").val();
	let postalcode_regex = /^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$/;
	if (postalcode_regex.test(postalcode_input)){
		$("#inputPostalcode").removeClass("is-invalid");
		$("#inputPostalcode").addClass("is-valid");
		postalcode_val = true;
	}
	else{
		$("#inputPostalcode").removeClass("is-valid");
		$("#inputPostalcode").addClass("is-invalid");
		postalcode_val = false;
	}
});

const input_inputPhonenumber = document.getElementById("inputPhonenumber");
input_inputPhonenumber.addEventListener("input", function (){
	let phonenumber_input = $("#inputPhonenumber").val();
	let phonenumber_regex = /^\d{10}$/;
	if (phonenumber_regex.test(phonenumber_input)){
		$("#inputPhonenumber").removeClass("is-invalid");
		$("#inputPhonenumber").addClass("is-valid");
		phonenumber_val = true;
	}
	else{
		$("#inputPhonenumber").removeClass("is-valid");
		$("#inputPhonenumber").addClass("is-invalid");
		phonenumber_val = false;
	}
});

const input_inputEmail = document.getElementById("inputEmail");
input_inputEmail.addEventListener("input", function (){
	let email_input = $("#inputEmail").val();
	let email_regex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (email_regex.test(email_input)){
		$("#inputEmail").removeClass("is-invalid");
		$("#inputEmail").addClass("is-valid");
		email_val = true;
	}
	else{
		$("#inputEmail").removeClass("is-valid");
		$("#inputEmail").addClass("is-invalid");
		email_val = false;
	}
});

// create the Province, States and Departments according to the country selected 1 = Canada, 2 = US, 3 = Colombia

function fill_countries(num){
	let country_input = num;
	if (country_input === "1") {
		//if the country selected is Canada it show the canadian provinces
		country_name = "ca";
		$("#inputProvince").empty();
		$("#inputProvince").append("<option>Alberta</option>");
		$("#inputProvince").append("<option>BC</option>");
		$("#inputProvince").append("<option>Manitoba</option>");
		$("#inputProvince").append("<option>New Brunswick</option>");
		$("#inputProvince").append("<option>Newfoundland and Labrador</option>");
		$("#inputProvince").append("<option>Northwest Territories</option>");
		$("#inputProvince").append("<option>Nova Scotia</option>");
		$("#inputProvince").append("<option>Nunavut</option>");
		$("#inputProvince").append("<option>Ontario</option>");
		$("#inputProvince").append("<option>Prince Edward Island</option>");
		$("#inputProvince").append("<option>Quebec</option>");
		$("#inputProvince").append("<option>Saskatchewan</option>");
		$("#inputProvince").append("<option>Yukon</option>");

	} else if (country_input === "2") {
		//if the country selected is US it show the US states
		country_name = "us";
		$("#inputProvince").empty();
		$("#inputProvince").append("<option>Alabama</option>");
		$("#inputProvince").append("<option>Alaska</option>");
		$("#inputProvince").append("<option>Arizona</option>");
		$("#inputProvince").append("<option>Arkansas</option>");
		$("#inputProvince").append("<option>California</option>");
		$("#inputProvince").append("<option>Colorado</option>");
		$("#inputProvince").append("<option>Connecticut</option>");
		$("#inputProvince").append("<option>Delaware</option>");
		$("#inputProvince").append("<option>Florida</option>");
		$("#inputProvince").append("<option>Georgia</option>");
		$("#inputProvince").append("<option>Hawaii</option>");
		$("#inputProvince").append("<option>Idaho</option>");
		$("#inputProvince").append("<option>Illinois</option>");
		$("#inputProvince").append("<option>Indiana</option>");
		$("#inputProvince").append("<option>Iowa</option>");
		$("#inputProvince").append("<option>Kansas</option>");
		$("#inputProvince").append("<option>Kentucky</option>");
		$("#inputProvince").append("<option>Louisiana</option>");
		$("#inputProvince").append("<option>Maine</option>");
		$("#inputProvince").append("<option>Maryland</option>");
		$("#inputProvince").append("<option>Massachusetts</option>");
		$("#inputProvince").append("<option>Michigan</option>");
		$("#inputProvince").append("<option>Minnesota</option>");
		$("#inputProvince").append("<option>Mississippi</option>");
		$("#inputProvince").append("<option>Missouri</option>");
		$("#inputProvince").append("<option>Montana</option>");
		$("#inputProvince").append("<option>Nebraska</option>");
		$("#inputProvince").append("<option>Nevada</option>");
		$("#inputProvince").append("<option>New Hampshire</option>");
		$("#inputProvince").append("<option>New Jersey</option>");
		$("#inputProvince").append("<option>New Mexico</option>");
		$("#inputProvince").append("<option>New York</option>");
		$("#inputProvince").append("<option>North Carolina</option>");
		$("#inputProvince").append("<option>North Dakota</option>");
		$("#inputProvince").append("<option>Ohio</option>");
		$("#inputProvince").append("<option>Oklahoma</option>");
		$("#inputProvince").append("<option>Oregon</option>");
		$("#inputProvince").append("<option>Pennsylvania</option>");
		$("#inputProvince").append("<option>Rhode Island</option>");
		$("#inputProvince").append("<option>South Carolina</option>");
		$("#inputProvince").append("<option>South Dakota</option>");
		$("#inputProvince").append("<option>Tennessee</option>");
		$("#inputProvince").append("<option>Texas</option>");
		$("#inputProvince").append("<option>Utah</option>");
		$("#inputProvince").append("<option>Vermont</option>");
		$("#inputProvince").append("<option>Virginia</option>");
		$("#inputProvince").append("<option>Washington</option>");
		$("#inputProvince").append("<option>West Virginia</option>");
		$("#inputProvince").append("<option>Wisconsin</option>");
		$("#inputProvince").append("<option>Wyoming</option>");

	}
	else if (country_input === "3"){
		//if the country selected is US it show the Colombian Departments
		country_name = "co";
		$("#inputProvince").empty();
		$("#inputProvince").append("<option>Amazonas</option>");
		$("#inputProvince").append("<option>Antioquia</option>");
		$("#inputProvince").append("<option>Arauca</option>");
		$("#inputProvince").append("<option>Atlántico</option>");
		$("#inputProvince").append("<option>Bolívar</option>");
		$("#inputProvince").append("<option>Boyacá</option>");
		$("#inputProvince").append("<option>Caldas</option>");
		$("#inputProvince").append("<option>Caquetá</option>");
		$("#inputProvince").append("<option>Casanare</option>");
		$("#inputProvince").append("<option>Cauca</option>");
		$("#inputProvince").append("<option>Cesar</option>");
		$("#inputProvince").append("<option>Chocó</option>");
		$("#inputProvince").append("<option>Córdoba</option>");
		$("#inputProvince").append("<option>Cundinamarca</option>");
		$("#inputProvince").append("<option>Guainía</option>");
		$("#inputProvince").append("<option>Guaviare</option>");
		$("#inputProvince").append("<option>Huila</option>");
		$("#inputProvince").append("<option>La Guajira</option>");
		$("#inputProvince").append("<option>Magdalena</option>");
		$("#inputProvince").append("<option>Meta</option>");
		$("#inputProvince").append("<option>Nariño</option>");
		$("#inputProvince").append("<option>Norte de Santander</option>");
		$("#inputProvince").append("<option>Putumayo</option>");
		$("#inputProvince").append("<option>Quindío</option>");
		$("#inputProvince").append("<option>Risaralda</option>");
		$("#inputProvince").append("<option>San Andrés y Providencia</option>");
		$("#inputProvince").append("<option>Santander</option>");
		$("#inputProvince").append("<option>Sucre</option>");
		$("#inputProvince").append("<option>Tolima</option>");
		$("#inputProvince").append("<option>Valle del Cauca</option>");
		$("#inputProvince").append("<option>Vaupés</option>");
		$("#inputProvince").append("<option>Vichada</option>");
	}
}

const input_inputCountry = $("#inputCountry");
input_inputCountry.on("input", function () {
	let country_input = input_inputCountry.val();
	fill_countries(country_input);
});

//check box shipping, if is check hide the shipping form if is true show the shipping form
let shipping_check_value = $('#shipping_CheckChecked').prop('checked');
//is hidden when start and when the user click it show the shipping form to complete.

$('#shipping_form').hide();
$('#shipping_CheckChecked').on("change", function () {
	shipping_check_value = $(this).prop('checked');
	if (shipping_check_value) {
		$('#shipping_form').hide();
		country_taxes = $('#inputCountry').val();
		province_taxes = $("#inputProvince").val();
	}
	else {
		$('#shipping_form').show();
		country_taxes = $('#inputCountry_shipping').val();
		province_taxes = $("#inputProvince").val();
	}
});

//Validation shipping info Name, postal code, country
const inputFName_shipping_ = document.getElementById("inputFName_shipping");
inputFName_shipping_.addEventListener("input", function (){
	let FName_shipping_input = $("#inputFName_shipping").val();
	if (ismachingFname(FName_shipping_input)){
		$("#inputFName_shipping").removeClass("is-invalid");
		$("#inputFName_shipping").addClass("is-valid");
	}
	else{
		$("#inputFName_shipping").removeClass("is-valid");
		$("#inputFName_shipping").addClass("is-invalid");
	}
});
const inputLName_shipping_ = document.getElementById("inputLName_shipping");
inputLName_shipping_.addEventListener("input", function (){
	let LName_shipping_input = $("#inputLName_shipping").val();
	if (ismachingFname(LName_shipping_input)){
		$("#inputLName_shipping").removeClass("is-invalid");
		$("#inputLName_shipping").addClass("is-valid");
	}
	else{
		$("#inputLName_shipping").removeClass("is-valid");
		$("#inputLName_shipping").addClass("is-invalid");
	}
});

const input_inputCountry_shipping = $("#inputCountry_shipping");
input_inputCountry_shipping.on("input", function () {
	let country_input_ = input_inputCountry_shipping.val();
	if (country_input_ === "1") {
		//if the country selected is Canada it show the canadian provinces
		$("#inputProvince_shipping").empty();
		$("#inputProvince_shipping").append("<option>Alberta</option>");
		$("#inputProvince_shipping").append("<option>BC</option>");
		$("#inputProvince_shipping").append("<option>Manitoba</option>");
		$("#inputProvince_shipping").append("<option>New Brunswick</option>");
		$("#inputProvince_shipping").append("<option>Newfoundland and Labrador</option>");
		$("#inputProvince_shipping").append("<option>Northwest Territories</option>");
		$("#inputProvince_shipping").append("<option>Nova Scotia</option>");
		$("#inputProvince_shipping").append("<option>Nunavut</option>");
		$("#inputProvince_shipping").append("<option>Ontario</option>");
		$("#inputProvince_shipping").append("<option>Prince Edward Island</option>");
		$("#inputProvince_shipping").append("<option>Quebec</option>");
		$("#inputProvince_shipping").append("<option>Saskatchewan</option>");
		$("#inputProvince_shipping").append("<option>Yukon</option>");

	} else if (country_input_ === "2") {
		//if the country selected is US it show the US states
		$("#inputProvince_shipping").empty();
		$("#inputProvince_shipping").append("<option>Alabama</option>");
		$("#inputProvince_shipping").append("<option>Alaska</option>");
		$("#inputProvince_shipping").append("<option>Arizona</option>");
		$("#inputProvince_shipping").append("<option>Arkansas</option>");
		$("#inputProvince_shipping").append("<option>California</option>");
		$("#inputProvince_shipping").append("<option>Colorado</option>");
		$("#inputProvince_shipping").append("<option>Connecticut</option>");
		$("#inputProvince_shipping").append("<option>Delaware</option>");
		$("#inputProvince_shipping").append("<option>Florida</option>");
		$("#inputProvince_shipping").append("<option>Georgia</option>");
		$("#inputProvince_shipping").append("<option>Hawaii</option>");
		$("#inputProvince_shipping").append("<option>Idaho</option>");
		$("#inputProvince_shipping").append("<option>Illinois</option>");
		$("#inputProvince_shipping").append("<option>Indiana</option>");
		$("#inputProvince_shipping").append("<option>Iowa</option>");
		$("#inputProvince_shipping").append("<option>Kansas</option>");
		$("#inputProvince_shipping").append("<option>Kentucky</option>");
		$("#inputProvince_shipping").append("<option>Louisiana</option>");
		$("#inputProvince_shipping").append("<option>Maine</option>");
		$("#inputProvince_shipping").append("<option>Maryland</option>");
		$("#inputProvince_shipping").append("<option>Massachusetts</option>");
		$("#inputProvince_shipping").append("<option>Michigan</option>");
		$("#inputProvince_shipping").append("<option>Minnesota</option>");
		$("#inputProvince_shipping").append("<option>Mississippi</option>");
		$("#inputProvince_shipping").append("<option>Missouri</option>");
		$("#inputProvince_shipping").append("<option>Montana</option>");
		$("#inputProvince_shipping").append("<option>Nebraska</option>");
		$("#inputProvince_shipping").append("<option>Nevada</option>");
		$("#inputProvince_shipping").append("<option>New Hampshire</option>");
		$("#inputProvince_shipping").append("<option>New Jersey</option>");
		$("#inputProvince_shipping").append("<option>New Mexico</option>");
		$("#inputProvince_shipping").append("<option>New York</option>");
		$("#inputProvince_shipping").append("<option>North Carolina</option>");
		$("#inputProvince_shipping").append("<option>North Dakota</option>");
		$("#inputProvince_shipping").append("<option>Ohio</option>");
		$("#inputProvince_shipping").append("<option>Oklahoma</option>");
		$("#inputProvince_shipping").append("<option>Oregon</option>");
		$("#inputProvince_shipping").append("<option>Pennsylvania</option>");
		$("#inputProvince_shipping").append("<option>Rhode Island</option>");
		$("#inputProvince_shipping").append("<option>South Carolina</option>");
		$("#inputProvince_shipping").append("<option>South Dakota</option>");
		$("#inputProvince_shipping").append("<option>Tennessee</option>");
		$("#inputProvince_shipping").append("<option>Texas</option>");
		$("#inputProvince_shipping").append("<option>Utah</option>");
		$("#inputProvince_shipping").append("<option>Vermont</option>");
		$("#inputProvince_shipping").append("<option>Virginia</option>");
		$("#inputProvince_shipping").append("<option>Washington</option>");
		$("#inputProvince_shipping").append("<option>West Virginia</option>");
		$("#inputProvince_shipping").append("<option>Wisconsin</option>");
		$("#inputProvince_shipping").append("<option>Wyoming</option>");

	}
	else if (country_input_ === "3"){
		//if the country selected is US it show the Colombian Departments
		$("#inputProvince_shipping").empty();
		$("#inputProvince_shipping").append("<option>Amazonas</option>");
		$("#inputProvince_shipping").append("<option>Antioquia</option>");
		$("#inputProvince_shipping").append("<option>Arauca</option>");
		$("#inputProvince_shipping").append("<option>Atlántico</option>");
		$("#inputProvince_shipping").append("<option>Bolívar</option>");
		$("#inputProvince_shipping").append("<option>Boyacá</option>");
		$("#inputProvince_shipping").append("<option>Caldas</option>");
		$("#inputProvince_shipping").append("<option>Caquetá</option>");
		$("#inputProvince_shipping").append("<option>Casanare</option>");
		$("#inputProvince_shipping").append("<option>Cauca</option>");
		$("#inputProvince_shipping").append("<option>Cesar</option>");
		$("#inputProvince_shipping").append("<option>Chocó</option>");
		$("#inputProvince_shipping").append("<option>Córdoba</option>");
		$("#inputProvince_shipping").append("<option>Cundinamarca</option>");
		$("#inputProvince_shipping").append("<option>Guainía</option>");
		$("#inputProvince_shipping").append("<option>Guaviare</option>");
		$("#inputProvince_shipping").append("<option>Huila</option>");
		$("#inputProvince_shipping").append("<option>La Guajira</option>");
		$("#inputProvince_shipping").append("<option>Magdalena</option>");
		$("#inputProvince_shipping").append("<option>Meta</option>");
		$("#inputProvince_shipping").append("<option>Nariño</option>");
		$("#inputProvince_shipping").append("<option>Norte de Santander</option>");
		$("#inputProvince_shipping").append("<option>Putumayo</option>");
		$("#inputProvince_shipping").append("<option>Quindío</option>");
		$("#inputProvince_shipping").append("<option>Risaralda</option>");
		$("#inputProvince_shipping").append("<option>San Andrés y Providencia</option>");
		$("#inputProvince_shipping").append("<option>Santander</option>");
		$("#inputProvince_shipping").append("<option>Sucre</option>");
		$("#inputProvince_shipping").append("<option>Tolima</option>");
		$("#inputProvince_shipping").append("<option>Valle del Cauca</option>");
		$("#inputProvince_shipping").append("<option>Vaupés</option>");
		$("#inputProvince_shipping").append("<option>Vichada</option>");
	}
});

//order check_out build the products with the taxes previus the complete order button

function order_checkout_(){
	if (total_ == 0 ){
		$('.orderdetailsitems').remove();
		$("#order_details_totals_sub").html("<b>$"+ total_.toFixed(2)+"</b>");
		shipping_cost = 0;
		$("#order_details_totals_shipping").html("<b>$"+ shipping_cost.toFixed(2)+"</b>");
		taxes_cost =0;
		$("#order_details_totals_tax").html("<b>$"+ taxes_cost.toFixed(2)+"</b>");
		total_cost_with_taxes = 0;
		$("#order_details_totals_total").html("<b>$"+ total_cost_with_taxes.toFixed(2)+"</b>");
	}
	else {
		$('.orderdetailsitems').empty();
		//get all the ids that are in the shopping cart with map
		let ids = $('.newitem').map(function() {
			let match = $(this).attr('id').match(/\d+/);
			if (match) {
				return match[0];
			}
		}).get();
		let uniqueIds = $.unique(ids);

		let items_orderdetails = "";
		// print all the product in the shopping cart using the ids
		for(let i = 0; i < uniqueIds.length;i++){
			let order_title = $(`#title_${uniqueIds[i]}`)[0].innerHTML;
			let order_quantity = $(`#quantity_${uniqueIds[i]}`)[0].innerHTML;
			let order_price = $(`#price_${uniqueIds[i]}`)[0].innerHTML;
			let order_total = $(`#total_${uniqueIds[i]}`)[0].innerHTML;
			items_orderdetails += `
										<div id="order_title_${uniqueIds[i]}" class="col mb-3 text-center orderdetailsitems">${order_title}</div>
										<div id="order_quantity_${uniqueIds[i]}" class="col mb-3 text-center orderdetailsitems">${order_quantity}</div>
										<div id="order_price_${uniqueIds[i]}" class="col mb-3 text-center orderdetailsitems">${order_price}</div>
										<div id="order_total_${uniqueIds[i]}" class="col mb-3 text-end orderdetailsitems">${order_total}</div>

								`;

		}
		$('#order_details').append(items_orderdetails);
	}
}

//taxes calculation GST HST and PST
function calculate_taxes() {
	country_taxes = $('#inputCountry_shipping').val();
	province_taxes = $("#inputProvince_shipping").val();
	if(country_taxes == 1) {
		//taxes GST HST
		if(province_taxes == "New Brunswick" || province_taxes == "New Foundland and Labrador" || province_taxes == "Nova Scotia" || province_taxes == "Princes Edward Island") {
			province_taxes_GSTHST = 0.15;
		}
		else if(province_taxes == "Ontario" ) {
			province_taxes_GSTHST = 0.13;
		}
		else{
			province_taxes_GSTHST = 0.05;
		}
		//taxes PST
		if(province_taxes == "BC" || province_taxes == "Manitoba") {
			province_taxes_PST = 0.07;
		}
		else if(province_taxes == "Quebec" ) {
			province_taxes_PST = 0.09975;
		}
		else if(province_taxes == "Saskatchewan" ) {
			province_taxes_PST = 0.06;
		}
		else{
			province_taxes_PST = 0.0;
		}
	}
	else{
		//free tax in us and Colombia
		province_taxes_GSTHST= 0.0;
		province_taxes_PST = 0.0;
	}
	calculate_total();
}

$("#inputCountry_shipping").on("change", function(){
	calculate_taxes();
});
$("#inputProvince_shipping").on("change", function(){
	calculate_taxes();
});

//Checkout button, final validation, and json data

$('#final_errors_validation').hide();
function send_data_end_point_() {
	//validate credict card before sending json
	if(!credit_card_val && !expirationDate_val && !credit_card_CVV_val){
		$('#submit_ModalLabel').text("Please complete the information !").css('color', 'red').addClass('text-danger');
		$('#final_info').text("Your credit card information is incomplete!");
		$('#final_errors_validation').text("Please complete the information of your credit card.");
		$('#final_errors_validation').show();
	}
	//validatite billing info before sending json
	else if (!fname_val && !lname_val && !postalcode_val && !phonenumber_val && !email_val) {
		$('#submit_ModalLabel').text("Please complete the information !").css('color', 'red').addClass('text-danger');
		$('#final_info').text("The billing information is incomplete, check names, postal code, phone number and email!");
		$('#final_errors_validation').text("Please complete the billing information.");
		$('#final_errors_validation').show();
	}
	//validate at leat one product in cart before sending json
	else if (total_ == 0){
		$('#submit_ModalLabel').text("Please complete the information !").css('color', 'red').addClass('text-danger');
		$('#final_info').text("Add at least one product to your shopping cart.");
		$('#final_errors_validation').text("Add at least one product to your shopping cart.");
		$('#final_errors_validation').show();
	}
	else{
		// if the information is complete then complete the json text and fetch to the camosun server.
		$("#submit_ModalLabel").removeClass("text-danger");
		$('#submit_ModalLabel').text(" Success! ").css('color', 'green').addClass('text-success');
		$('#submit_ModalLabel').append(" <i class=\"bi bi-bag-check\"></i>");
		$('#final_info').text("Your order was successfully placed!");
		let cardnumber_ = $("#cardNumber").val().replace(/\s/g, "");
		let expiry_month_ = $("#expirationDate_mm").val();
		let expiry_year_ = parseInt($("#expirationDate_yy").val());
		let security_code_ = parseInt($("#cardNumber_cvv").val());
		let amount_ = parseFloat(total_cost_with_taxes);
		let currency_ = currency_name;
		//billing info
		let first_name_bill = $("#inputFName").val();
		let last_name_bill = $("#inputLName").val();
		let address_1_bill = $("#inputAddress").val();
		let address_2_bill = $("#inputAddress2").val();
		let city_bill = $("#inputCity").val();
		let province_bill = province_name;
		let country_bill = country_name;
		let postal_bill = $("#inputPostalcode").val();
		let phone_bill = $("#inputPhonenumber").val();
		let email_bill = $("#inputEmail").val();
		let json_text = `{
							"card_number": "${cardnumber_}", 
							"expiry_month": "${expiry_month_}", 
							"expiry_year": ${expiry_year_}, 
							"security_code": ${security_code_}, 
							"amount": ${amount_},
							"currency": "${currency_}", 
							"billing": {
									"first_name": "${first_name_bill}",
									"last_name": "${last_name_bill}",
									"address_1": "${address_1_bill}",
									"address_2": "${address_2_bill}",
									"city": "${city_bill}",
									"province": "${province_bill}",
									"country": "${country_bill}",
									"postal": "${postal_bill}",
									"phone": "${phone_bill}",
									"email": "${email_bill}"
								},
							"shipping": {
									"first_name": "${first_name_bill}",
									"last_name": "${last_name_bill}",
									"address_1": "${address_1_bill}",
									"address_2": "${address_2_bill}",
									"city": "${city_bill}",
									"province": "${province_bill}",
									"country": "${country_bill}",
									"postal": "${postal_bill}"
								}
							}`;

		// parse the text to json form and send it
		async function submitForm() {
			const submision = JSON.parse(json_text);
			let form_data = new FormData();
			form_data.append('submision', JSON.stringify(submision));
			try {
				const response = await fetch('https://deepblue.camosun.bc.ca/~c0180354/ics128/final/', {
					method: "POST",
					cache: 'no-cache',
					body: form_data
				});
				console.log("success: " + response);
			} catch (error) {
				console.log("Error: " + error);
			}
		}
		submitForm();
		car_clear_();
		clear_data();
	}
}
//after buying the items the data is clear for another purchase order.
function clear_data() {
	$('#submit_ModalLabel').val("");
	$("#cardNumber").removeClass("is-valid");
	$("#cardNumber").addClass("is-invalid");
	$("#cardNumber").val("");
	$("#expirationDate_mm").val("");
	$("#expirationDate_yy").val("");
	$("#expirationDate_yy").removeClass("is-valid");
	$("#expirationDate_yy").addClass("is-invalid");
	$("#expirationDate_mm").removeClass("is-valid");
	$("#expirationDate_mm").addClass("is-invalid");
	$("#cardNumber_cvv").val("");
	$("#cardNumber_cvv").removeClass("is-valid");
	$("#cardNumber_cvv").addClass("is-invalid");
	//billing info
	$("#inputFName").val("");
	$("#inputLName").val("");
	$("#inputAddress").val("");
	$("#inputAddress2").val("");
	$("#inputCity").val("");
	$("#inputPostalcode").val("");
	$("#inputPhonenumber").val("")
	$("#inputEmail").val("");
	//booleans reset to first value
	credit_card_val = false;
	expirationDate_val = false;
	credit_card_CVV_val = false;
	fname_val = false;
	lname_val = false;
	postalcode_val = false;
	phonenumber_val = false;
	email_val = false;
}