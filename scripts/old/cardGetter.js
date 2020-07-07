const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cardJson = require("./korten.json");

const cardErrorLog = [];

(async function () {
  const imageUrls = cardJson.map((card) => card.image_card);

  const cardInfos = imageUrls.map((url) => toCardInfo(url));
  console.info("\t\t\t");
  console.info(" - DOWNLOADING");
  for (const card of cardInfos) {
    await downloadCard(card);
  }
  console.info(" - DONE");
  if (cardErrorLog.length) {
    console.info(" ---- Could not download the following cards --- ");
    for (const entry of cardErrorLog) {
      console.info(entry.cardInfo.name);
    }
  }
  console.info("\t\t\t");
})();

function toCardInfo(url) {
  const name = url.split("/").pop().split("generate_").pop();
  return {
    url,
    path: path.join(__dirname, "cards", name),
    name,
  };
}

async function downloadCard(cardInfo) {
  try {
    await downloadImage(cardInfo.url, cardInfo.path);
    console.info(" -- downloaded card: " + cardInfo.name);
  } catch (error) {
    console.error(
      " -- FAILED to download card: " +
        cardInfo.name +
        ", at url: " +
        cardInfo.url
    );
    console.info(" --- error: " + error.message);
    // fs.unlink(cardInfo.path, err => {
    //     if (err) {
    //         console.info(' --- could not delete file after error in download')
    //     }
    // });
    cardErrorLog.push({ error, cardInfo });
  }
}

async function downloadImage(url, path) {
  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });
  const writeStream = fs.createWriteStream(path);
  response.data.pipe(writeStream);

  await new Promise((resolve, reject) => {
    response.data.on("end", resolve);
    response.data.on("error", reject);
  });
}
