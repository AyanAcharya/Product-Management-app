import { Category } from '../models/category.model.js';
import{asyncHandler} from "../utils/asyncHandlar.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"


// Add a new category
const addCategory = asyncHandler(async (req, res) => {
  const { name, image } = req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, "category name is required");
  }

  // Check if category name is unique
  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    throw new ApiError(400, "Category name already exists");
  }

  const categoryImage =await req.files?.image[0]?.path;
  if(!categoryImage){
    throw new ApiError(400,"category Image is required")
  }
  
  let categoryImg;
  try {
    categoryImg = await uploadOnCloudinary(categoryImage);
    console.log('Uploaded image:', categoryImg);
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new ApiError(500, "Failed to upload category image");
  }

  // Ensure category image was uploaded successfully
  if (!categoryImg || !categoryImg.secure_url) {
    throw new ApiError(500, "Failed to upload category image");
  }

  // Create the category
  const category = await Category.create({
    name,
    image: categoryImg.secure_url
  });

  if (!category) {
    throw new ApiError(500, "Something went wrong while creating the category");
  }

  return res.status(201).json(
    new ApiResponse(201, category, "Category created successfully")
  );
});

 const showCategories = asyncHandler(async (req, res) => {
  // Fetch all categories from the database
  const categories = await Category.find();

  // Respond with the list of categories
  res.status(200).json(new ApiResponse(200, categories, 'List of all categories'));
});

export { addCategory,showCategories };
