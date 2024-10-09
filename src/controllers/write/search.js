'use strict';

const api = require('../../api');
const helpers = require('../helpers');

const Search = module.exports;
const Topics = require('../topics');

Search.categories = async (req, res) => {
	helpers.formatApiResponse(200, res, await api.search.categories(req, req.query));
};

Search.topicSearchCategory = async (req, res) => {
	const { cid } = req.params;
	const { query } = req.query;

	if (!cid || !query) {
		return res.status(400).json({ error: 'Category ID and query are required.' });
	}

	try {
		const topics = await searchTopicsInCategory(cid, query);
		return helpers.formatApiResponse(200, res, topics);
	} catch (error) {
		console.error('Search error:', error);
		return res.status(500).json({ error: 'An error occurred while searching topics.' });
	}
};

async function searchTopicsInCategory(cid, query) {
	const results = await Topics.find({
		categoryId: cid,
		title: { $regex: query, $options: 'i' },
	});
	return results;
}

Search.roomUsers = async (req, res) => {
	const { query, uid } = req.query;
	helpers.formatApiResponse(200, res, await api.search.roomUsers(req, { query, uid, ...req.params }));
};

Search.roomMessages = async (req, res) => {
	const { query } = req.query;
	helpers.formatApiResponse(200, res, await api.search.roomMessages(req, { query, ...req.params }));
};
