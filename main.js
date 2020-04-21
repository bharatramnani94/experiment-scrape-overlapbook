const puppeteer = require('puppeteer');

const CONFIG = {
  useHeadlessBrowser: true,
}

const DATA = {
  urlOfIndexPage: "https://seanwes.com/overlapbook/",
}

const openBrowser = async() => {
  const browser = await puppeteer.launch({ headless: CONFIG.useHeadlessBrowser });
  return browser;
}

const scrapeChapters = async (browser) => {
  const page = await browser.newPage();
  await page.goto(DATA.urlOfIndexPage);
  await page.waitFor(1000);
  const result = await page.evaluate(() => {
    const chapters = [...document.querySelectorAll('.post-article ul ul li a')].map(anchorTag => {
      const title = anchorTag.innerText;
      const url = anchorTag.href;
      return { title, url };
    });
    return chapters;
  });
  return result;
}

const scrapeEverything = async () => {
  const browser = await openBrowser();
  const chapters = await scrapeChapters(browser);
  browser.close();
  return chapters;
};

(async() => {
  const result = await scrapeEverything();
  console.log(result);
})();
