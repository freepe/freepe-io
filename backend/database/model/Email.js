"use strict";

var schema = [
	{
		name: 'email',
		type: 'String',
		mandatory: true
	},
	{
		name: 'key',
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
	},
	{
		name: 'ref_link',
		type: 'String',
		mandatory: true,
		min: 17,
		max: 17
	},
	{
		name: 'used',
		type: 'Boolean'
	}
];

var indexes = [
	{
		name: 'Email.email',
		type:'unique'
	}
];

module.exports = {
	name: 'Email',
	schema: schema,
	indexes: indexes
};