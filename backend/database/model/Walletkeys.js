"use strict";

var schema = [
	{
		name: 'owner',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'encrypted',
		type: 'String',
		mandatory: true,
		min: 52,
	},
	{
		name: 'salt',
		type: 'String',
		mandatory: true,
		max: 24
	},
	{
		name: 'iv',
		type: 'String',
		mandatory: true,
		min: 16,
		max: 16,
	},
	{
		name: 'tag',
		type: 'String',
		mandatory: true,
		min: 24,
		max: 24,
	},
];

var indexes = [
	{
		name: 'Walletkeys.owner',
		type:'unique'
	},
];


module.exports = {
	name: 'Walletkeys',
	schema:schema,
	indexes: indexes
};