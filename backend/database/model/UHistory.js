"use strict";

var schema = [
	{
		name: 'uid',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'event',
		type: 'String',
	},
	{
		name: 'type',
		type: 'String',
	},
	{
		name: 'reason',
		type: 'String',
	},
	{
		name: 'initiator',
		type: 'String',
	},
	{
		name: 'val',
		type: 'String',
	},
	{
		name: 'result',
		type: 'String',
	},
	{
		name: 'time',
		type: 'Long',
		mandatory: true
	},
];

var indexes = [
];


module.exports = {
	name: 'UHistory',
	schema:schema,
	indexes: indexes
};