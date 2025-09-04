# Danbooru API Tunneling (Express.js + DoH)

For some reason my network just doesn’t wanna talk to Danbooru’s API/CDN directly.  
DNS fails, requests hang, it’s annoying.  

So I built a tiny Express.js proxy that:
- Uses **Cloudflare DoH (1.1.1.1)** instead of the system DNS
- Proxies both **API JSON** and **CDN file content**
- Keeps endpoints clean with two prefixes:
  - `/api/json` → Danbooru API
  - `/api/content` → CDN (images, files, etc.)

---

## How it works
### JSON (API stuff)
Normal:
[](https://danbooru.donmai.us/posts.json?tags=arknights)

Through the tunnel:
[](http://localhost:3000/api/json/posts.json?tags=arknights)

### Content (images/files)
Normal: 
[](https://cdn.donmai.us/original/12/1c/content-file.jpg)

Through the tunnel:
[](http://localhost:3000/api/content/original/12/1c/content-file.jpg)

---

## Setup
Needs Node.js (v18+ recommended).

```bash
git clone https://github.com/yourname/danbooru-doh-proxy.git
cd danbooru-doh-proxy
npm install
npm start
```

Server will be running at:
[](http://localhost:3000)

## Scripts
In `package.json` there are two scripts:

- `npm run dev` → starts the server with **nodemon** (auto-restarts on file changes)  
- `npm start` → starts the server with **node** (normal mode)  

## Config 
Check [](src/commons.js)

```js
const CLOUDFLARE_DOH = "https://1.1.1.1/dns-query";
const DANBOORU_URL = "https://danbooru.donmai.us";
const CDN_DANBOORU_URL = "https://cdn.donmai.us";

const CONTENT_PATH = "/api/content";
const JSON_PATH = "/api/json";
```

- Default DoH = Cloudflare (1.1.1.1)
- `DANBOORU_URL` → used for JSON API
- `CDN_DANBOORU_URL` → used for content (images/files)
- Change these if you want to use another DoH provider or mirror.

## Notes
- This is just a hacky personal project, not production-ready.
- If you’re using it a lot, you might wanna add caching to avoid rate limits.
- Respect Danbooru’s [API rules](https://danbooru.donmai.us/wiki_pages/help:api).
- MIT licensed → use it however, just don’t blame me if it breaks.

## License 
MIT
