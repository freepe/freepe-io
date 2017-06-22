"use strict";

var schema = [
	{
		name: 'email',
		type: 'String',
		mandatory: true
	},
	{
		name: 'type',
		type: 'String',
		mandatory: true
	},
	{
		name: 'time',
		type: 'Long',
		mandatory: true
	},
	{
		name: 'data',
		type: 'String',
		mandatory: true
	},
];

var indexes = [
	{
		name: 'EmailTrigger.email',
		type:'unique'
	}
];

module.exports = {
	name: 'EmailTrigger',
	schema: schema,
	indexes: indexes
};