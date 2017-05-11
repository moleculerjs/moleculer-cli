"use strict";

let { ServiceBroker } 	= require("moleculer");
let MyService 			= require("../../index");

// Create broker
let broker = new ServiceBroker({
	logger: console
});

// Load other services
//broker.loadService(path.join(__dirname, "..", "test.service"));

// Load my service
broker.createService(MyService);

// Start server
broker.start();
