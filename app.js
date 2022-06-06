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

  let searchURL = "https://www.leboncoin.fr/recherche?category=3&text=" + encodeURI(config.search_input) + "&locations=Toulouse__43.59743304757554_1.4471155185604891_10000_20000"
  await page.goto(searchURL, {waitUntil : 'domcontentloaded'});

	/* HTML Structure of LBC
	<div class="styles_classifiedColumn__FvVg5">
		<div class="sc-bdVaJa fKGgoF">
			This is the list of ads elements
			<div class="styles_adCard__HQRFN styles_classified__rnsg4"></div>
			<div class="styles_adCard__HQRFN styles_classified__rnsg4"></div>
			<div class="styles_adCard__HQRFN styles_classified__rnsg4"></div>
			...
		</div>
	</div>
	*/
	let mainContainerSelector = "div.sc-bdVaJa.fKGgoF";
	//let mainContainerSelector = "#mainContent > div.sc-PLyBE.eAbTXL > div > div.styles_Listing__rqSnx.styles_listing--generic__VwY9Y > div.styles_classifiedColumn__FvVg5";
	//let adListElemSelector = "#mainContent > div.sc-iGrrsa.bJUYEF > div > div.styles_Listing__rqSnx.styles_listing--bigPicture__d_z8s > div.styles_classifiedColumn__FvVg5 > div.sc-bdVaJa.fKGgoF > div:nth-child(1)";

	await page.waitForSelector(mainContainerSelector);
  const mainContainer = await page.$$(mainContainerSelector);
  //const firstChild = ads_list[0];
  let adsList = await mainContainer.evaluate(el => el.innerHTML);
  console.log(mainContainer);
  console.log(adsList);
	console.log("ENORME");
  //const firstChild = await

  /*await page.waitForTimeout(50000)
  cookies = await page.cookies()
  const cookieJson = JSON.stringify(cookies)
  fs.writeFileSync('new_cookies_lbc.json', cookieJson)
  console.log(cookieJson);*/

})
