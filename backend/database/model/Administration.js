"use strict";

var schema = [
	{
		name: 'uid',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'access',
		type: 'String',
	},
	{
		name: 'level',
		type: 'Integer',
	},
];

var indexes = [
];


module.exports = {
	name: 'Administration',
	schema:schema,
	indexes: indexes
};