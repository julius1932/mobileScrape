const puppeteer = require('puppeteer');
var URL = require('url-parse');
var jsonfile = require('jsonfile');
var START_URL = "https://www.flipkart.com/mobile-phones-store?otracker=nmenu_sub_Electronics_0_Mobiles";
var MAX_PAGES_TO_VISIT = 1000;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];

var url = new URL(START_URL);
var baseUrl = url.protocol + "//" + url.hostname;
var count=0;
/*pagesToVisit.push(`https://www.flipkart.com/vivo-x21-black-128-gb/p/itmf5g4jncexzfgt?pid=M
OBF5G4JFCYRDQZB&lid=LSTMOBF5G4JFCYRDQZBEKRZES&fm=neo/merchandising&iid=M_0c338a1
5-1059-43bc-ba05-8e53524925e3_7.DFNRBDJUJNPY&ppt=CLP&ppn=CLP:mobile-phones-store
&otracker=clp_omu_Mobile+New+Launches_8_6+GB+RAM+%7C+128+GB+ROM_mobile-phones-st
ore_DFNRBDJUJNPY_6&cid=DFNRBDJUJNPY`); */
pagesToVisit.push(START_URL);
var file='newData.json';
var pagesToVisit=jsonfile.readFileSync('links.json');
var items =jsonfile.readFileSync(file);
var useless = jsonfile.readFileSync('useless.json');
var arrModel=[];
var keyss= Object.keys(items);
pagesToVisit = pagesToVisit.filter(item => !keyss.includes(item));
pagesToVisit = pagesToVisit.filter(item => !useless.includes(item));
async function crawl() {
    if(pagesToVisit.length<=0 ) {
        console.log("all pages visted "+count+" items ."+items.length+"  all now");
        if(items.length>=0){
            jsonfile.writeFile(file,items, {spaces: 2},function (err) {//
               console.error(err+' ==');
            });
        }
        return ;
    }
    console.log(pagesToVisit.length+ " links left");
    var nextPage = pagesToVisit.shift();
     if (nextPage in pagesVisited) {
           // We've already visited this page, so repeat the crawl
           crawl();
        } else {

         // New page we haven't visited
    if(nextPage==null){
        crawl();
    }
    const browser = await puppeteer.launch({ headless:true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(nextPage);
    //await page.screenshot({path: 'image-staples.png', fullPage: true});

    try{
       //await page.click('button._2AkmmA.uSQV49');
       await page.waitForSelector("div#container div.bzeytq._3cTEY2");
    }catch(error) {
    // console.error(error+" >>>>>>");
    }
    //await page.waitForSelector("a.div.product-image a.scTrack.pfm");
  console.log("on-------"+nextPage);
    let hotelData = await page.evaluate(() => {
        let hotels = [];
        // get the hotel elements
        //  let lnkElms = document.querySelectorAll('a.K6IBc-.required-tracking , a._31qSD5');
        var  description = document.querySelector("div#container div.bzeytq._3cTEY2");
        if(description){
            description = description.textContent.trim();
        }
        var  productDescription = document.querySelector("div._3u-uqB");
        if(productDescription){
            productDescription = productDescription.textContent.trim();
        }
        var  brand = document.querySelector("span._35KyD6");
        if(brand){
            brand = brand.textContent.trim();
        }
        var modelNumber;
        var  model;
        var sound;
        var selectedArrKey = document.querySelectorAll("div._3Rrcbo div._2RngUh ul li._3_6Uyw.row  div._3-wDH3.col.col-3-12");
          var selectedArrValue = document.querySelectorAll('div._3Rrcbo div._2RngUh ul li._3_6Uyw.row  ul._2k4JXJ.col.col-9-12');
        if(selectedArrKey && selectedArrValue){
        //  model=selectedArrKey[0].textContent.trim();
            for(var i=0;i<selectedArrKey.length;i++){
             var txt =selectedArrKey[i].textContent.trim();
             if(txt==="Model Number"){
                 modelNumber=selectedArrValue[i].textContent.trim();
             }
             if(txt==="Model Name"){
                 model=selectedArrValue[i].textContent.trim();
             }
             if(txt==="Sound Enhancements"){
                 sound=selectedArrValue[i].textContent.trim();
             }
             if( model && sound && modelNumber ){
               break;
             }
          }
        }
        return {
            brand:brand,
            model:model,
            modelNumber:modelNumber,
            sound:sound,
            productDescription:productDescription,
            description:description
          }

    });


    console.log("BRAND : "+hotelData.brand+", MODEL : "+hotelData.model+",SOUND : "+hotelData.sound+' ,'+"modelNumber : "+hotelData.modelNumber);
    console.log(" description : "+hotelData.description);
    console.log(" productDescription : "+hotelData.productDescription);

    if(hotelData.brand && ! items[nextPage]){
        count++;
        items[nextPage]=hotelData;
        if(count>0 && count %10==0){
          console.log(count+" ><<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>");
          jsonfile.writeFile(file,items, {spaces: 2},function (err) {//
             console.error(err+' ==');
          });

        }
    }else{
      useless.push(nextPage);
      if(useless.length>0 && useless.length% 5==0){
      jsonfile.writeFile('useless.json',useless, {spaces: 2},function (err) {//
         console.error(err+' ==');
      });
      }
    }
    browser.close();
    crawl();
}

}
crawl();
