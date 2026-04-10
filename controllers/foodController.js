import FoodModel from "../models/foodModel.js";
import cloudinary from "../config/cloudinary.js";

// ADD FOOD
const addFood = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.json({ success: false, message: "No image uploaded" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "food-delivery" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    const food = new FoodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: result.secure_url,
      public_id: result.public_id
    });

    await food.save();

    res.json({ success: true, message: "Food Added", data: food });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error adding food" });
  }
};

// LIST FOOD
const listFood = async (req, res) => {
  try {
    const foods = await FoodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Error fetching food" });
  }
};

// REMOVE FOOD
const removeFood = async (req, res) => {
  try {
    const food = await FoodModel.findById(req.body.id);

    if (food.public_id) {
      await cloudinary.uploader.destroy(food.public_id);
    }

    await FoodModel.findByIdAndDelete(req.body.id);

    res.json({ success: true, message: "Food Removed" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error removing food" });
  }
};

export { addFood, listFood, removeFood };