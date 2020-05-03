import { GetDbController } from "./db";
import { GetCNBCTexts } from "./cnbc";

const main = async () => {
  const texts = await GetCNBCTexts();

  if (!texts) {
    console.log("Fetching texts failed for CNBC");
    return;
  }

  console.log("Adding texts to db...");

  const dbController = await GetDbController();

  for (const text of texts) {
    await dbController.createText(text);
  }

  console.log("Added texts to db");
};

main();
