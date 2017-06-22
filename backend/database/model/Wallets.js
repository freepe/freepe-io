"use strict";

var schema = [
	{
		name: 'owner',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'address',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'name',
		type: 'String',
		max: 40
	},
	{
		name: 'description',
		type: 'String',
		max: 500
	},
	{
		name: 'last_opened',
		type: 'Long',
		mandatory: true
	},
	{
		name: 'type',// FPN or BTC
		type: 'String',
		mandatory: true
	},
];

var indexes = [
	{
		name: 'Wallets.address',
		type:'unique'
	},
];


module.exports = {
	name: 'Wallets',
	schema:schema,
	indexes: indexes
};