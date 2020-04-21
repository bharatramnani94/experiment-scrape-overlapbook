# Quick Scraping experiment using Puppeteer

A simple NodeJS app which goes to https://seanwes.com/overlapbook/, gets the chapters list, opens them one at a time (sequentially), gets the HTML content for each of them, and them saves all that to an output folder.
An index (index.html) is also created to navigate the chapters easily locally in the generated output folder.

![Demo](demo/demo.gif)

## Running

- `npm install`
- `node main.js`

## Improvements that could be implemented (Known):

Coding-Related:

- ⛓️ Scrape each chapter parallelly - This is consciously kept to scrape-one-page-at-a-time right now so as to to minimize the load on the browser (to prevent opening multiple pages in parallel), and since the list of chapters is small anyway (27 at the time of writing). But of course, improvements are clearly possible here.

- ~~💅 Make things pretty - Improve CSS for the index page as well as other pages~~

- 🔨Refactor the code to multiple files/modules instead of a single _main.js_

Non-Coding-Related:

- ~~🎦 Add a GIF or video that shows this in action.~~

- ℹ️ Add copyrights and disclaimer and originally appeared url to each page and to index page

## Extra

Subscribe to seanwes.com if you found the output generated here helpful by any means, he publishes amazing content regularly.

Also, feel free to raise a PR or two if you feel like it.