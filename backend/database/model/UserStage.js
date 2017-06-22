"use strict";

var schema = [
	{
		name: 'uid',
		type: 'String',
		mandatory: true
	},
	{
		name: 'stage',
		type: 'Integer',
		mandatory: true
	},
	{
		name: 'updated',
		type: 'Long',
		mandatory: true
	},
];

var indexes = [
	{
		name: 'UserStage.uid',
		type:'unique'
	}
];

module.exports = {
	name: 'UserStage',
	schema: schema,
	indexes: indexes
};