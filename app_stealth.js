const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const main = async function() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0"
  );
  await page.goto("https://www.youtube.com");
  await page.screenshot({ path: "testlbc.png", fullPage: true });

  await browser.close();
};

main();
