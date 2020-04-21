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

const scrapeChapters = async (url, page) => {
  await page.goto(url);
  const result = await page.evaluate(() => {
    const chapters = [
      ...document.querySelectorAll(".post-article ul ul li a"),
    ].map((anchorTag) => {
      const title = anchorTag.innerText;
      const url = anchorTag.href;
      return { title, url };
    });
    return chapters;
  });
  return result;
};

const scrapeChapter = async (url, page) => {
  await page.goto(url);
  const result = await page.evaluate(() => {
    const htmlContent = document.querySelector(".booksection").innerHTML;
    return htmlContent;
  });
  return result;
}

const scrapeEverything = async () => {
  const browser = await openBrowser();
  const page = await browser.newPage();
  const chapters = await scrapeChapters(DATA.urlOfIndexPage, page);
  const finalResult = [];
  for (const chapter of chapters) {
    const url = chapter.url;
    const title = chapter.title;
    const content = await scrapeChapter(chapter.url, page);
    finalResult.push({ title, url, content });
  }
  browser.close();
  return finalResult;
};

(async() => {
  const result = await scrapeEverything();
  console.log(result);
})();
