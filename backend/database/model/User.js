"use strict";

var schema = [
	{
		name: 'email',
		type: 'String',
		mandatory: true,
		min: 8,
	},
	{
		name: 'login',
		type: 'String',
		min: 4,
        max: 20
	},
	{
		name: 'username',
		type: 'String',
		mandatory: true,
		min: 1,
		max: 100
	},
	{
		name: 'password',
		type: 'String',
		mandatory: true,
		min: 30,
		max: 50
	},
	{
		name: 'ref_link',
		type: 'String',
		mandatory: true,
		min: 17,
		max: 17
	},
	{
		name: 'fpt',
		type: 'Integer',
		mandatory: true,
		min: 0,
		max: 10000
	},
	{
		name: 'active',
		type: 'Boolean',
		mandatory: true,
	},
	{
		name: 'time',
		type: 'Long',
		mandatory: true
	},
];

var indexes = [
	{
		name: 'User.email',
		type:'unique'
	},
	{
		name: 'User.ref_link',
		type:'unique'
	},
];

// do not create unique index User.login
// always check if login is busy before creating new user

module.exports = {
	name: 'User',
	schema:schema,
	indexes: indexes
};