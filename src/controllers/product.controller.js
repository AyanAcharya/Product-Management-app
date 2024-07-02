import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { User } from '../models/user.model.js';
import{asyncHandler} from "../utils/asyncHandlar.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';

// Add a new product
const addProduct = asyncHandler(async (req, res) => {
  const { title, details, category, owner_id } = req.body;
  const productImage = req.files?.image?.[0]?.path; // Access the uploaded image path

  // Validate required fields
  if (!title || !details || !category || !owner_id || !productImage) {
    throw new ApiError(400, "All fields are required");
  }

  // Validate category existence
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(400, "Invalid category");
  }

  // Validate owner existence
  const ownerExists = await User.findById(owner_id);
  if (!ownerExists) {
    throw new ApiError(400, "Invalid owner");
  }

  // Upload image to Cloudinary
  let productImg;
  try {
    productImg = await uploadOnCloudinary(productImage);
    console.log('Uploaded image:', productImg);
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new ApiError(500, "Failed to upload product image");
  }

  // Ensure product image was uploaded successfully
  if (!productImg || !productImg.secure_url) {
    throw new ApiError(500, "Failed to upload product image");
  }

  // Create the product
  const product = await Product.create({
    title,
    image: productImg.secure_url,
    details,
    category: categoryExists._id,
    owner: ownerExists._id
  });

  if (!product) {
    throw new ApiError(500, "Something went wrong while creating the product");
  }

  // Aggregation to include user and category details
  const productWithDetails = await Product.aggregate([
    { $match: { _id: product._id } },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDetails'
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    {
      $addFields: {
        ownerDetails: { $arrayElemAt: ['$ownerDetails', 0] },
        categoryDetails: { $arrayElemAt: ['$categoryDetails', 0] }
      }
    }
  ]);

  if (!productWithDetails.length) {
    throw new ApiError(500, "Something went wrong while fetching product details");
  }

  return res.status(201).json(
    new ApiResponse(201, productWithDetails[0], "Product created successfully")
  );
});


// Update selected fields of an existing product
const updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id; // Product ID to update
  const { title, image, details } = req.body;

  // Validate required fields
  if (!title || !details) {
    throw new ApiError(400, "Title and details are required");
  }

  // Check if a new image is uploaded
  let updatedProduct;
  if (req.files && req.files.image) {
    try {
      const productImage = req.files.image[0].path;
      const productImg = await uploadOnCloudinary(productImage);

      if (!productImg || !productImg.secure_url) {
        throw new ApiError(500, "Failed to upload product image to Cloudinary");
      }

      // Update product with new image URL
       updatedProduct = await Product.findByIdAndUpdate(productId, {
        title,
        image: productImg.secure_url,
        details
      }, { new: true });
      

    } catch (error) {
      console.error('Error uploading image or updating product:', error);
      throw new ApiError(500, "Failed to update product");
    }

  } else {
    // Update product without changing the image
    updatedProduct = await Product.findByIdAndUpdate(productId, {
      title,
      details
    }, { new: true });
  }

  if (!updatedProduct) {
    throw new ApiError(500, "Failed to update product!");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedProduct, "Product updated successfully")
  );
});


const filterProducts = asyncHandler(async (req, res) => {
  const { userId, categoryId } = req.query;

  try {
    const query = {};
    if (userId && categoryId) {
      query.$and = [
        { owner: userId },
        { category: categoryId }
      ];
    } else {
      if (userId) {
        query.owner = userId;
      }
      if (categoryId) {
        query.category = categoryId;
      }
    }

    const products = await Product.find(query)
                                  .populate('category', 'name')
                                  .populate('owner', 'username email');

    res.status(200).json(new ApiResponse(200, products, 'Filtered products based on userId and categoryId'));
  } catch (error) {
    console.error('Error filtering products:', error);
    res.status(500).json(new ApiResponse(500, null, 'Internal Server Error'));
  }
});




export { addProduct,updateProduct,filterProducts };
