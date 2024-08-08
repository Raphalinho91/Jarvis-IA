import mongoose, { Document, Schema, model } from "mongoose";

interface IHouse extends Document {
  address: string;
  size: string;
  price: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  description?: string;
}

// Define the House schema
const HouseSchema: Schema = new Schema(
  {
    address: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: String, required: true },
    numberOfBedrooms: { type: Number, required: true },
    numberOfBathrooms: { type: Number, required: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create the House model
const House = model<IHouse>("House", HouseSchema);

export default House;
