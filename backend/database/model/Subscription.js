"use strict";

var schema = [
	{
		name: 'email',
		type: 'String',
		mandatory: true
	},
	{
		name: 'time',
		type: 'Long',
		mandatory: true
	},
	{
		name: 'type',
		type: 'String',
		mandatory: true
	}
];

var indexes = [
];

module.exports = {
	name: 'Subscription',
	schema: schema,
	indexes: indexes
};