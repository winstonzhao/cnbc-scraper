import mongoose, { Schema } from "mongoose";
import { Text, TextDocument } from "./types";

export const TextSchema: Schema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, required: true },
});

export const TextModel = mongoose.model<TextDocument>("texts", TextSchema);

export class DbController {
  initiated = false;

  async init() {
    await mongoose.connect("mongodb://localhost", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    this.initiated = true;
  }

  async findText(id: string) {
    return new Promise<TextDocument | null>((res, rej) =>
      TextModel.findOne({ id }, (err, t) => {
        if (err) rej(err);
        res(t);
      })
    );
  }

  async createText(text: Text) {
    const exists = await this.findText(text.id);

    if (exists) {
      return;
    }

    await TextModel.create({
      ...text,
    });
  }

  async disconnect() {
    return await mongoose.disconnect();
  }
}

const dbController = new DbController();

export const GetDbController = async () => {
  if (!dbController.initiated) {
    await dbController.init();
  }

  return dbController;
};
