"use strict";

const _ = require("lodash");
const db = require("../database");

module.exports = function (Topics) {
	Topics.search = async function (query, options) {
		if (!query) {
			return [];
		}
		query = String(query).toLowerCase();

		// Fetch all topic IDs (or a subset if using pagination)
		const allTids = await db.getSortedSetRevRange("topics:recent", 0, 1000);

		// Fetch topic data based on the IDs
		let topics = await Topics.getTopicsByTids(allTids, { uid: options.uid });

		// Filter topics by search query
		topics = topics.filter(
			(topic) =>
				topic &&
				((topic.title && topic.title.toLowerCase().includes(query)) ||
					(topic.description &&
						topic.description.toLowerCase().includes(query))),
		);

		// Do sorting here
		if (options.sort === "newest") {
			topics = _.orderBy(topics, ["timestamp"], ["desc"]);
		} else if (options.sort === "oldest") {
			topics = _.orderBy(topics, ["timestamp"], ["asc"]);
		}

		return topics;
	};
};

// 'use strict';

// const _ = require('lodash');

// const privilege = require('../privilege');
// const plugins = require('../plugins');
// const db = require('../database');
// const { search } = require('.');

// module.exports = function (Posts) {
//     Posts.search = async function (data) {
//         const query = data.query || '';
//         const page = data.page || 1;
//         const pid = data.pid || 0;
//         const paginate = data.hasOwnProperty('paginate') ? data.paginate : true;
//         const searchBy = data.searchBy || 'keywords';

//         let pids = [];
//         if (searchBy === 'keywords') {
//             pids = await searchByKeywords(query);
//         }
//         // Add other searchBy options here

//         const result = await plugins.hooks.fire('filter:posts.search', { pids: pids, pid: pid});
//         pids = result.pids;

//         const searchResult = {
//             matchCount: pids.length,
//         };

//         if (paginate) {
//             const resultsPerPage = data.resultsPerPage || 50;
//             const start = Math.max(0, page - 1) * resultsPerPage;
//             const stop = start + resultsPerPage;
//             searchResult.pageCount = Math.ceil(pids.length / resultsPerPage);
//             pids = pids.slice(start, stop);
//         }

//         return searchResult;
//     }

//     async function searchByKeywords(query) {
//         const keywordsArr = query.split(' ');
//         keywordsArr = keywordsArr.map(keyword => keyword.toLowerCase());
//         const topics = await db.getSortedSetRevRange('post:pid', 0, -1);
//         topics = topics.filter(topic => {
//             keywordsArr.some(keyword =>
//                 topic.title.toLowerCase().includes(keyword) ||
//                 topic.content.toLowerCase().includes(keyword))
//         })

//         const pids = topics.map(topic => topic.pid);
//         return pids;
//     }
// };
