const express = require("express")
const { Readable } = require("stream");
const router = express.Router();

const fetcher = require("./fetch-dns.js");
const { JSON_PATH, CONTENT_PATH, CDN_DANBOORU_URL, DANBOORU_URL } = require("./commons.js");

function deepReplace(obj, find, replace) {
	if (typeof obj === "string") {
		return obj.includes(find) ? obj.replaceAll(find, replace) : obj;
	} else if (Array.isArray(obj)) {
		return obj.map(item => deepReplace(item, find, replace));
	} else if (obj && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [key, deepReplace(value, find, replace)])
		);
	}
	return obj;
}

router.get(/json(.*)/, async (req, res) => {
	const escapeRoute = JSON_PATH
	const booruRoute = req.originalUrl.slice(escapeRoute.length);
	
	const bridge = DANBOORU_URL + booruRoute;
	const result = await fetcher(bridge, {
		timeout: 20000
	});

	if(!result) {
		res.status(400).send({
			message: "failed to resolve " + booruRoute 
		})
		return
	}

	const json = await result.json();
	const hardCodePath = CONTENT_PATH 
	const fullUrl = req.protocol + '://' + req.get('host') + hardCodePath
	const preserved = deepReplace(json, process.env.CDN_DANBOORU_URL, fullUrl);
	res.send(preserved)
})

router.get(/content(.*)/, async (req, res) => {
	const escapeRoute = JSON_PATH
	const booruRoute = req.originalUrl.slice(escapeRoute.length);

	const bridge = CDN_DANBOORU_URL + booruRoute;
	const filetypes = ["jpg", "png", "webp", "gif", "swf", "webm", "mp4", "zip"]

	const result = await fetcher(bridge, {
		timeout: 20000
	})

	const repr = { idx: 0 }
	const contentType = result.headers.get("content-type")
	const contains = filetypes.some((it, idx) => {
		const nr = bridge.includes(it)
		if(nr) repr.idx = idx
		return bridge.includes(it)
	})

	res.setHeader("Content-Type", contentType)

	if(contains) {
		if(repr.idx < 3 /* gif start */) {
			const buffer = Buffer.from(await result.arrayBuffer());
			res.setHeader("Content-Disposition", "inline");
			res.send(buffer)
		} else {
			Readable.fromWeb(result.body).pipe(res)
		}
	}
})

module.exports = router
