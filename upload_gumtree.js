const puppeteer = require('puppeteer');

async function uploadGumtree () {
  // Init
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 930, height: 6000 })
  const delay = (delay = 750) => page.waitFor(delay)

  // Signing in
  await page.goto('https://www.gumtree.com.au/t-login-form.html');
  await page.type('#login-email', process.env.GUMTREE_EMAIL);
  await page.type('#login-password', process.env.GUMTREE_PASSWORD);
  page.click('#btn-submit-login');
  await page.waitForNavigation();
  console.log("logged in");

  // Delete previous ad
  await page.evaluate('document.evaluate("//a[contains(., \'2004 Audi A3 Hatchback\')]", document, null, XPathResult.ANY_TYPE, null ).iterateNext().parentElement.parentElement.parentElement.parentElement.getElementsByClassName(\'delete-ad\')[0].click()')
  const reasonSelector = '#NO_REASON';
  await page.waitForSelector(reasonSelector);
  await page.click('#NO_REASON')
  await page.click('#autoResponse')
  await page.click('#delete-ad-confirm')
  console.log("Ad deleted")

  // First step Ad creation
  page.goto('https://www.gumtree.com.au/p-post-ad.html');
  await page.waitForNavigation();
  await page.type('#title', '2004 Audi A3 Hatchback')
  page.click('.button--primary')
  await new Promise(function(resolve) {
    page.on('response', response => {
      if (response.url() === "https://www.gumtree.com.au/p-post-ad-ajax-suggest-category.json") {
        resolve(response);
      }
    });
  });
  await page.waitForSelector('.category-suggestion__list li');
  page.click('.category-suggestion__list li')
  await page.waitForNavigation();
  console.log("1st step ad creation done")

  // Second Step Wizzard Ad creation
  await page.evaluate('document.evaluate("//label[contains(., \'Negotiable\')]", document, null, XPathResult.ANY_TYPE, null ).iterateNext().click()')
  await page.tap("#pstad-price")
  await page.type("#pstad-price", "7000")
  await page.evaluate('document.evaluate("//label[contains(., \'Private seller\')]", document, null, XPathResult.ANY_TYPE, null ).iterateNext().click()')
  await page.select('select[name=\'attributeMap\\[cars.carmake_s\\]\']', 'audi')
  await new Promise(function(resolve) {
    page.on('response', response => {
      if (response.url().includes('audi')) {
        resolve(response);
      }
    });
  });
  await page.select('select[name=\'attributeMap\\[cars.carmodel_s\\]\']', 'audi_a3')
  await new Promise(function(resolve) {
    page.on('response', response => {
      if (response.url().includes('make=Audi&model=A3')) {
        resolve(response);
      }
    });
  });
  await page.select('#cars_year', '2004')
  await new Promise(function(resolve) {
    page.on('response', response => {
      if (response.url().includes('make=Audi&model=A3&year=2004')) {
        resolve(response);
      }
    });
  });
  await page.select("#cars_variant", '2.0 FSI AMBITION')
  await new Promise(function(resolve) {
    page.on('response', response => {
      if (response.url().includes('make=Audi&model=A3&year=2004&variant=2.0%20FSI%20AMBITION')) {
        resolve(response);
      }
    });
  });
  await page.evaluate('document.evaluate("//input[contains(@value, \'DQR04G\')]", document, null, XPathResult.ANY_TYPE, null ).iterateNext().parentElement.parentElement.click()')
  await page.type('input[name=\'attributeMap\\[cars.carmileageinkms_i\\]\']', '133000')
  await page.select('select[name=\'attributeMap\\[cars.colour_s\\]\']', 'blue')
  await page.select('select[name=\'attributeMap\\[cars.airconditioning_s\\]\']', 'y')
  await page.select('select[name=\'attributeMap\\[cars.registered_s\\]\']', 'y')
  await page.evaluate('document.evaluate("//input[contains(@name, \'cars.registrationexpiry\')]", document, null, XPathResult.ANY_TYPE, null ).iterateNext().value=\'2018-06-29T00:00:00Z\'')
  await page.tap("#pstad-descrptn")
  await page.type('#pstad-descrptn', `
This Audi has had all the maintenance done, it is in perfect conditions.


It has very few kms for its price: 130,000kms.


It has leather seat, sunroof, air conditioning... Was always parked in an indoor garage.


Overall amazing car, reliable, sportive at a very small price.


Only reason we are selling is that it starts to be too small as we now have a baby.
  
  `)
  console.log("Finished 2n step, now uploading pictures")


  const dropZoneInput = await page.$('#inputfile');
  dropZoneInput.uploadFile(
    '/Users/olivier/Desktop/final_audi/1.jpg',
    '/Users/olivier/Desktop/final_audi/2.jpg',
    '/Users/olivier/Desktop/final_audi/3.jpg',
    '/Users/olivier/Desktop/final_audi/4.jpg',
    '/Users/olivier/Desktop/final_audi/5.jpg',
    '/Users/olivier/Desktop/final_audi/6.jpg',
  );
  await delay(3000)
  await page.waitForXPath("//button[@id = 'pstad-frmsubmit' and not(contains(@class, 'disabled')) and not(contains(@class, 'c-hide'))]")
  await delay(30000)
  console.log("Pictures finished uploading, now submitting the form")

  page.click("#pstad-frmsubmit")
  await page.waitForNavigation();
  await browser.close();
}

module.exports =  uploadGumtree;
