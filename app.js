// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
const puppeteer = require('puppeteer-extra')
const fs = require('fs')
const args = process.argv.slice(2);
let config = null;
if(args.length > 0){config = require(args[0]);}
else{config = require('./config.json');}

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

let url = "https://www.leboncoin.fr/"

//==========LAUNCH PUPPETEER===========
// That's it, the rest is puppeteer usage as normal 😊
puppeteer.launch({ headless: false, defaultViewport: null, args:['--start-maximized'] }).then(async browser => {
	//=========Start Browser=========
	const page = await browser.newPage()
  const navigationPromise = page.waitForNavigation()
  await page.setViewport({
    width: 1366,
    height: 568,
    deviceScaleFactor: 1,
  });
	//====Inject cookies + Go to /sell page====
	let cookies = fs.readFileSync(config.cookiesFilePath, 'utf8');
	const deserializedCookies = JSON.parse(cookies);
	await page.setCookie(...deserializedCookies);

  await page.goto(url, {waitUntil : 'domcontentloaded'});

  await page.waitForTimeout(50000)

  cookies = await page.cookies()
  const cookieJson = JSON.stringify(cookies)
  fs.writeFileSync('new_cookies_lbc.json', cookieJson)
  console.log(cookieJson);

})
