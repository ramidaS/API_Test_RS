const axios = require('axios')
const config = require('./config')
const allAPIsFunctions = require('./allAPIsFunctions')
var chai = require('chai')
    , chaiHttp = require('chai-http')
var expect = require('expect')
var should = require('chai').should()
chai.use(chaiHttp)
const calculationFunctions = require('./calculationFunctions')
var moment = require('moment')
moment().format();

let responseBody = []
let expectedStatusCode = 200
let expectedOrderStatus = 'CANCELLED'

function checkCancelledOrder(responseBody, orderId, expectedStatusCode, expectedOrderStatus){
		if(responseBody.status === 200){
			responseBody.status.should.equal(expectedStatusCode)
			responseBody.data.status.should.equal(expectedOrderStatus)
			responseBody.data.should.have.property('cancelledAt')
			responseBody.data.should.have.property('id')
			responseBody.data.id.should.equal(orderId)

		}
		else if(responseBody.status === 422)
		{
			responseBody.status.should.equal(expectedStatusCode)
			responseBody.data.should.have.property('message')
			responseBody.data.message.should.equal('Order status is COMPLETED already')
		}
		else if(responseBody.status === 404)
		{	
			responseBody.status.should.equal(expectedStatusCode)
			responseBody.data.should.have.property('message')
			responseBody.data.message.should.equal('ORDER_NOT_FOUND')
		}
		else{
			console.log('invalid')
		}

	}

describe('/Put cancelOrder', function(){

	let scheduledTime = new Date("2019-09-15T15:10:18.061Z")
	let orderAt = moment.utc(scheduledTime)
	let orderId = 0
	let locations = [
	    {
	        "lat": 22.344674, "lng": 114.124651
	    },
	    {
	        "lat": 22.375384, "lng": 114.182446
	    },
	    {
	        "lat": 22.385669, "lng": 114.186962
	    }
	]
	let responseBody = []

	beforeEach(async function(){
		let response = await allAPIsFunctions.scheduleOrder(orderAt,locations)
		orderId = response.data.id
		return response, orderId
	})

	it('1: Cancel ASSIGNING order', async function(){
		let cancelledOrder = await allAPIsFunctions.cancelOrder(orderId)
		checkCancelledOrder(cancelledOrder, orderId, 200, 'CANCELLED')

	})

	it('2: Cancel ONGOING order', async function(){
		await allAPIsFunctions.driverTakeOrder(orderId)
		let cancelledOrder = await allAPIsFunctions.cancelOrder(orderId)
		checkCancelledOrder(cancelledOrder, orderId, 200, 'CANCELLED')
	})

	it('3: Cancel COMPLETED order', async function(){
		await allAPIsFunctions.driverTakeOrder(orderId)
		await allAPIsFunctions.driverCompleteOrder(orderId)
		let cancelledOrder = await allAPIsFunctions.cancelOrder(orderId)
		checkCancelledOrder(cancelledOrder, orderId, 422)
	})

	it('4: Cancel cancelled order', async function(){				//This case is expected to be passed as result checked in Postman
		await allAPIsFunctions.driverTakeOrder(orderId)
		await allAPIsFunctions.cancelOrder(orderId)
		let cancelledOrder = await allAPIsFunctions.cancelOrder(orderId)
		checkCancelledOrder(cancelledOrder, orderId, 200, 'CANCELLED')
	})				

	it('5: Cancel invalid order', async function(){
		let cancelledOrder = await allAPIsFunctions.cancelOrder('abc')
		cancelledOrder.status.should.equal(404)
		cancelledOrder.data.should.equal('404 page not found\n')
	})

	it('6: Cancel non-existing order', async function(){			//Assume that orderId = 9999999 is not exists
		let cancelledOrder = await allAPIsFunctions.cancelOrder(9999999)
		checkCancelledOrder(cancelledOrder, orderId, 404)
	})
})