
/*
 * GET home page.
 */

exports.index = function(req, res, next){
	'use strict';

	//res.header('Access-Control-Allow-Origin', "*");
	//res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");

	var fs = require('fs'),
	exec = require('child_process').exec,
	csv = require('ya-csv'),
	r = require('librr').librr_c_api,
	command, options, out;

	var rr = r.createRRInstance();
	r.setTempFolder(rr, '/tmp');
	r.loadSBML(rr, req.body.sbml);
	var results = r.simulateEx(rr, 0, parseInt(req.body.sim.time, 10), parseInt(req.body.sim.steps, 10));
	var simData = r.resultToString(results).split('\n');
	simData.forEach(function(element, index, array) {
		array[index] = element.split('\t');
	});
	simData.pop();
	res.send(simData);
};
