'use strict';

const _ = require('lodash');
const db = require('../database');

module.exports = function (Topics) {
	Topics.search = async function (query, options) {
		if (!query) {
			return [];
		}
		query = String(query).toLowerCase();

		// Fetch all topic IDs (or a subset if using pagination)
		const allTids = await db.getSortedSetRevRange('topics:recent', 0, 1000);

		// Fetch topic data based on the IDs
		let topics = await Topics.getTopicsByTids(allTids, { uid: options.uid });

		// Filter topics by search query
		topics = topics.filter(topic => topic && (
			(topic.title && topic.title.toLowerCase().includes(query)) ||
                (topic.description && topic.description.toLowerCase().includes(query))
		));

		// Do sorting here
		if (options.sort === 'newest') {
			topics = _.orderBy(topics, ['timestamp'], ['desc']);
		} else if (options.sort === 'oldest') {
			topics = _.orderBy(topics, ['timestamp'], ['asc']);
		}

		return topics;
	};
};
