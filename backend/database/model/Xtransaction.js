"use strict";

var schema = [
	{
		name: 'a',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'b',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'c',
		type: 'String',
		mandatory: true,
		min: 24
	},
	{
		name: 'auser',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'buser',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'fromc',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'intoc',
		type: 'String',
		mandatory: true,
	},
	{
		name: 'acv',
		type: 'Long',
		min: 1,
		mandatory: true,
	},
	{
		name: 'bcv',
		type: 'Long',
		min: 1,
		mandatory: true,
	},
	{
		name: 'cencrypted',
		type: 'String',
		mandatory: true,
		min: 34
	},
	{
		name: 'expires',
		type: 'Long',
		mandatory: true,
	},
	{
		name: 'status',
		type: 'Integer',
		mandatory: true,
	},
];

var indexes = [
	{
		name: 'Xtransaction.c',
		type:'unique'
	},
];


module.exports = {
	name: 'Xtransaction',
	schema:schema,
	indexes: indexes
};