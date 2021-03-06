const axios = require("axios");
const config = require("./config");
const allAPIsFunctions = require("./allAPIsFunctions");
var checkResponse = require("./checkResponse");
var chai = require("chai");
var chaiHttp = require("chai-http");
var expect = chai.expect;
var should = chai.should();
const calculationFunctions = require("./calculationFunctions");
var moment = require("moment");
moment().format();

var today = new Date();

describe("/Post placeOrderUrl WITH orderAt value", function() {

	it("1: Should return HTTP 201 and created order with Schedule for next day.", async function(){

		var orderAt = moment.utc(today).add(1, "day");
		var stops =  [
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
    	var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201, "", orderAt);            
	})

	
	it("2: Should return HTTP 201 and created order for next hour.", async function(){

		var orderAt = moment.utc(today).add(1, "hour");
        var convertTime = moment(orderAt).format();
		var stops =  [
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
    	var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
	})

	
	it("3: Should return HTTP 400 because creating order with a bit passed date time. Expected 400", async function(){

		var orderAt = moment.utc(today);
		var stops =  [
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
    	var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 400, "field orderAt is behind the present time", orderAt);
	})

	
	it("4: Should return HTTP 201 and created order successfully even orderAt is null.", async function(){

		var orderAt = null;
		var stops =  [
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
    	var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
	})

	
	it("5: Should return HTTP 400 because orderAt is empty string. (Failed by intention because no error message handled.)", async function(){
		var orderAt = "";
		var stops =  [
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
    	var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 400, "field orderAt is empty", orderAt);
    	//Failed by intention because API returned message as empty string. Actually API should have error message to display.
	})

    
    it("6: Should return HTTP 201 and standard price rate for 05:00:00 to 21:59:59, $20 because the distance is less than 2 Km.", async function(){
        var date = "2019-10-10T05:00:00.000Z";
        var orderAt = moment.utc(date);
        var stops =  [                               
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.278967, "lng": 114.183168
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    })

    it("7: Should return HTTP 201 and price rate for 05:00:00 to 21:59:59, total distance is a bit more than 2km.", async function(){
        var date = "2019-10-10T21:00:00.000Z";
        var orderAt = moment.utc(date);
        var stops =  [                               // 2km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.281631, "lng": 114.189580
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    })
    
    it("8: Should return HTTP 201 and price rate for 05:00:00 to 21:59:59, total distance > 2 km, 2 stops.", async function(){
        var date = "2019-10-10T21:59:59.000Z";
        var orderAt = moment.utc(date);
        var stops =  [                               // ~21km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.342844, "lng": 114.205826
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    } )

    it("9: Should return HTTP 201 and price rate for 05:00:00 to 21:59:59, total distance > 2 km, 3 stops.", async function(){
        var date = "2019-10-10T22:00:00.000Z";
        var orderAt = moment.utc(date);
        var stops =  [                               //total ~3.5km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.278967, "lng": 114.183168
                },
                {
                    "lat": 22.281631, "lng": 114.172160   
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    } )

    it("10: Should return HTTP 201 and standard price rate for 22:00:00 - 04:59:59, $30 because distance < 2 km, 2 stops", async function(){
        var date = "2019-10-10T04:59:00.000Z";      
        var orderAt = moment.utc(date);
        var stops =  [                               // 1.5km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.278967, "lng": 114.183168
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    })

    it("11: Should return HTTP 201 and price rate for 22:00:00 - 04:59:59, total distance is a bit more than 2 km, 2 stops", async function(){
        var date = "2019-10-10T22:00:01.000Z";    
        var orderAt = moment.utc(date);
        var stops =  [                               // 2km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.281631, "lng": 114.189580
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);

    })

    it("12: Should return HTTP 201 and price rate for 22:00:00 - 04:59:59, total distance > 2 km, 2 stops.", async function(){
        var date = "2019-10-10T04:59:59.000Z";      
        var orderAt = moment.utc(date);
        var stops =  [                               // ~21km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.342844, "lng": 114.205826
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    })

    it("13: Should return HTTP 201 and price rate for 22:00:00 - 04:59:59, total distance > 2 km, 3 stops.", async function(){
        var date = "2019-10-10T01:50:30.000Z";      
        var orderAt = moment.utc(date);
        var stops =  [                               // ~21km
                {
                    "lat": 22.276148, "lng": 114.172160
                },
                {
                    "lat": 22.278967, "lng": 114.183168
                },
                {
                    "lat": 22.281631, "lng": 114.172160   
                }
        ];
        var response = await allAPIsFunctions.scheduleOrder(orderAt,stops);
        calculationFunctions.checkPlaceOrderResponse(response, 201,"", orderAt);
    })
})



