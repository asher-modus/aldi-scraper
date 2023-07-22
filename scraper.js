//make sure it simplifies everything one function at a time --- then do it together
//make sure it adds comments
//figure out whyyy it does the two bananas

//Helps us with scraping
const puppeteer = require("puppeteer");
//Helps us create the fake dom
const { JSDOM } = require("jsdom");

//Main function
async function scrapeAldiStorefront(
  url = "https://shop.aldi.us/store/aldi/storefront"
) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);
  await autoScroll(page);
  const html = await page.content();
  const products = parseData(html);
  await browser.close();
  return products;
}

//Scrolls the whole page to load in new producrs
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

//Gets all the elements from the fake dom
//Puts them in a product object
//Appends the product object to the products array

function parseData(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const productElements = document.querySelectorAll("div.e-13udsys");
  const products = [];
  productElements.forEach((element) => {
    const productName = getElementText(element, "span.e-8zabzc");
    const weight = getElementText(element, "div.e-1wczau3");
    const price = getPriceFromElement(element);
    const imageUrl = extractImageUrl(element, "div.e-ec1gba img");
    const productLink = element.querySelector("a.e-1dlf43s");
    const productId = extractProductId(productLink);
    const product = {
      name: productName,
      weight: weight,
      price: price,
      imageUrl: imageUrl,
      id: productId, // Unique identification number extracted from the product link
    };
    products.push(product);
  });
  return products;
}

function getElementText(element, selector) {
  const selectedElement = element.querySelector(selector);
  return selectedElement ? selectedElement.textContent.trim() : "";
}

function getPriceFromElement(element) {
  const priceElement = element.querySelector("div.e-hl17y4");
  if (priceElement) {
    // Retrieve only the first text node within the price element
    const priceText = priceElement.childNodes[0].textContent.trim();
    return priceText;
  }
  return "";
}

function extractImageUrl(element, selector) {
  const imageElement = element.querySelector(selector);
  const imageSrc = imageElement ? imageElement.getAttribute("srcset") : "";
  const regex = /\bhttps?:\/\/\S+/gi;
  const matches = imageSrc.match(regex);
  return matches && matches.length > 0 ? matches[0] : "";
}

function extractProductId(productLink) {
  if (productLink) {
    const href = productLink.getAttribute("href");
    const regex = /\/products\/(\d+)/;
    const matches = href.match(regex);
    if (matches && matches.length > 1) {
      return matches[1];
    }
  }
  return "";
}

module.exports = { scrapeAldiStorefront };

if (!module.parent) {
  const url = "https://shop.aldi.us/store/aldi/storefront";
  scrapeAldiStorefront(url)
    .then((products) => {
      products.shift();
      console.log(products);
      products.forEach((product) => {
        productName = product.name;
        //have implementation in here where we can add particular stuff to the products once we get the tags and what not... learn how to use gpt in javascript
      });
    })
    .catch((error) => {
      console.error(error);
    });
}
