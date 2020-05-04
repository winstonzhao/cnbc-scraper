import { GetDbController } from "./db";
import { GetCNBCTexts } from "./cnbc";

const main = async () => {
  let texts = await GetCNBCTexts();

  if (!texts) {
    console.log("Fetching texts failed for CNBC");
    return;
  }

  const dbController = await GetDbController();

  console.log(`Adding ${texts.length} texts to db...`);
  for (const text of texts) {
    await dbController.createText(text);
  }

  console.log("Added texts to db");

  await dbController.disconnect();
};

main();
