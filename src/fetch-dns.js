const undici = require("undici");
const { CLOUDFLARE_DOH } = require("./commons");

async function customLookup(hostname, options, callback) {
	try {
		const url = `${CLOUDFLARE_DOH}?name=${encodeURIComponent(hostname)}&type=A`;
		const res = await undici.fetch(url, {
			headers: { Accept: "application/dns-json" }
		})

		const data = await res.json()
		if(!data.Answer || data.Answer.length === 0) {
			return callback(new Error(`No Answer for: ${hostname}`));
		}

		const results = Array.from(data.Answer)
			.filter(ans => ans.type === 1)
			.map(ans => ({ address: ans.data, family: 4 }))

		if(options.all) return callback(null, results)
		else return callback(null, address[0], 4)
		
	} catch(err) {
		callback(err)
	}

};

async function fetcher(url, ...obj) {
	try {
		return await undici.fetch(url, {
			dispatcher: new undici.Agent({	
				connect: {
					lookup: customLookup
				}
			}),
			bodyTimeout: 30000,
			headersTimeout: 30000,
			...obj
		}) 
	} catch(e) {
		console.log(e)
		return null
	}
}

module.exports = fetcher
