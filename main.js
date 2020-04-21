const puppeteer = require('puppeteer');
const slugify = require("slugify");
const fs = require("fs");

const CONFIG = {
  useHeadlessBrowser: true,
  resultFolderPath: "./scraped/",
  pageTimeoutInMs: 60 * 1000,
}

const DATA = {
  urlOfIndexPage: "https://seanwes.com/overlapbook/",
  titleOfIndexPage: "Overlapbook"
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

const wrapContentInHtml = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" type="text/css">
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

const writeFile = async (filename, fileContent) => {
  fs.writeFile(filename, fileContent, { flag: 'w+' }, err => {
    if (err) { throw err; }
    return;
  });
}

const getIndexChapterContent = (title, chapters) => {
  return `
    <h1>${title}</h1>
    <ul>
      ${
        chapters.map(chapter => {
          const { title, fileName } = chapter;
          return `
            <li>
              <a href="${fileName}">${title}</a>
            </li>
          `
        }).join('\n')
      }
    </ul>
  `;
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
  await page.setDefaultNavigationTimeout(CONFIG.pageTimeoutInMs); // To allow enough time so that it does not times-out
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
    console.log("✅ Fetching chapter complete: " + title);
  }
  browser.close();
  return finalResult;
};

(async() => {
  console.log("✅ Start!");
  const result = await scrapeEverything();
  console.log("✅ Fetching all chapters complete.");
  createResultFolder(CONFIG.resultFolderPath);
  const beautifiedResult = result.map(singleResult => {
    const { title } = singleResult;
    const fileName = generateFilename(title) + ".html";
    const filePath = CONFIG.resultFolderPath + fileName;
    return { ...singleResult, fileName, filePath };
  });
  const [indexChapter, ...restOfTheChapters] = beautifiedResult;
  const indexContent = getIndexChapterContent(DATA.titleOfIndexPage, restOfTheChapters);
  await writeFile(indexChapter.filePath, wrapContentInHtml(indexContent));
  console.log("✅ Written successfully: " + indexChapter.filePath);
  for (const singleResult of restOfTheChapters) {
    const { content, filePath } = singleResult;
    await writeFile(filePath, wrapContentInHtml(content));
    console.log("✅ Written successfully: " + filePath);
  }
  console.log("✅ Success!");
  console.log("✅ End!");
})();
