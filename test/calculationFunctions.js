const axios = require("axios");
const config = require("./config");
const allAPIsFunctions = require("./allAPIsFunctions");
var chai = require("chai");
var expect = chai.expect;
var should = chai.should();
chai.use(require("chai-json-schema"));
var chaiHttp = require("chai-http");
var moment = require("moment");
moment().format();


var scheduledTime = new Date("2019-09-12T15:10:18.061Z");
var locations = [
    {
        "lat": 22.344674, "lng": 114.124651
    },
    {
        "lat": 22.375384, "lng": 114.182446
    },
    {
        "lat": 22.385669, "lng": 114.186962
    }
];

var responseSuccessSchema = {
	title: "place order success schema",
		type: "object",
		required: ["id", "drivingDistancesInMeters", "fare"],
		properties: { 
			drivingDistancesInMeters: {
				type: "array",
				uniqueItems: false,
				items: {
					type: "number"
				}
			},
			fare:{
				type:"object"
			}}};

var responseFailSchema = {
	title: "place order failed schema",
	type: "object",
	required: ["message"]
	};

var response = allAPIsFunctions.scheduleOrder(scheduledTime,locations);

	function totalDistanceCalculation(distance){
	    
	    totalDistance = distance.reduce(function(a, b) { return a + b; }, 0);

	    return totalDistance;
	}

	function priceCalculation(totalDistance, timeStamp){
		var standardDistance = 2000;
		var minPriceDay = 20;
		var minPriceNight = 30;
		var extraPriceDay = 5;
		var extraPriceNight = 8;
		var extraDistance = 0;
		var extraCharge = 0;
		var totalPrice = 0;
	
	if(totalDistance > standardDistance){	

	    if(timeStamp.hour() >= 5 && timeStamp.hour() < 22)			//5am - 10pm
	    	{
	    		h = timeStamp.hour();
	    		extraDistance = totalDistance-standardDistance;
	    		extraCharge = (extraDistance/200)*5;
	    		totalPrice = minPriceDay + parseFloat(extraCharge.toFixed(2));
	    		totalPrice = totalPrice.toFixed(2);
	    	}
	    	else if(timeStamp.hour() < 5 || (timeStamp.hour() >= 22 && timeStamp.minute() >= 0 && timeStamp.seconds() >= 0)){		//22:01-04:59
	    		extraDistance = totalDistance-standardDistance;
	    		extraCharge = (extraDistance/200)*8;
	    		totalPrice = minPriceNight + parseFloat(extraCharge.toFixed(2));
	    		totalPrice = totalPrice.toFixed(2);
	    	}
	    	else{
	    		console.log("Invalid Time or Invalid time format");
	    	}}

	else if(totalDistance <= standardDistance){
		if(timeStamp.hour() >= 5 && timeStamp.hour() <= 22)	{
	    	totalPrice = minPriceDay.toFixed(2);
	    }
	    else if (timeStamp.hour() < 5 || (timeStamp.hour() > 22 && timeStamp.minute() >= 0 && timeStamp.seconds() > 0)) {
	    	totalPrice = minPriceNight.toFixed(2);	
	    }
	}

	else{
	    	console.log("Invalid distance");
	    }
	    return totalPrice;
	    }


module.exports = {

	checkPlaceOrderResponse: function (responseBody, expectedStatus, errorMessage, orderAt){
		if(responseBody.status === 201){
			var drivingDistance = responseBody.data.drivingDistancesInMeters.reduce(function(a, b) { return a + b; }, 0);
		    var fareAmount = responseBody.data.fare.amount;
		    var currency = responseBody.data.fare.currency;
		    var timeStamp = 0;
		    if (orderAt === null || orderAt === undefined){
		    	var responseTime = responseBody.headers.date;
		    	timeStamp = moment.utc(responseTime);
		    }else if(orderAt !== undefined){
		    	timeStamp = moment.utc(orderAt);
		    }else{
		    	console.log("Invalid order time");
		    }
		    var distances = responseBody.data.drivingDistancesInMeters;
		    var totalDistances = totalDistanceCalculation(distances);
		    var totalPrice = priceCalculation(totalDistance, timeStamp);
		    currency.should.equal("HKD");
		    drivingDistance.should.equal(totalDistance);
		    fareAmount.should.equal(totalPrice);
		    expect(responseBody.data).to.be.jsonSchema(responseSuccessSchema);
			responseBody.status.should.equal(expectedStatus);
		    return	;			
		}
		else{
			responseBody.status.should.equal(expectedStatus);
			expect(responseBody.data).to.be.jsonSchema(responseFailSchema);
		    responseBody.data.message.should.equal(errorMessage);
		    return;
		}
	}
}




