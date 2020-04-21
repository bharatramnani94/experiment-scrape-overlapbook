const puppeteer = require('puppeteer');
const slugify = require("slugify");
const fs = require("fs");

const CONFIG = {
  useHeadlessBrowser: true,
  resultFolderPath: "./scraped/"
}

const DATA = {
  urlOfIndexPage: "https://seanwes.com/overlapbook/",
}

const generateFilename = (str) => {
  const options = {
    replacement: "-", // replace spaces with replacement character, defaults to `-`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
  };
  return slugify(str, options);
}

const createResultFolder = (folderName) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
}

const writeFile = async (filename, fileContent) => {
  fs.writeFile(filename, fileContent, { flag: 'w+' }, err => {
    if (err) { throw err; }
    return;
  });
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
  const indexAsAChapter = {
    url: "index",
    title: "index",
    content: chapters,
  }
  const finalResult = [indexAsAChapter];
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
  console.log("✅Fetching things complete.");
  createResultFolder(CONFIG.resultFolderPath);
  for (const singleResult of result) {
    const { title, content } = singleResult;
    const fileName = generateFilename(title);
    const filePath = CONFIG.resultFolderPath + fileName + ".html";
    await writeFile(filePath, content);
    console.log("✅ Written successfully: " + filePath);
  }
})();
