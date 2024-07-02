import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

    const productSchema = mongoose.Schema({
        title: {
          type: String,
          required: true,
        },
        image: {
          type: String,//cloudinary url
          required: true,
        },
        details: {
          type: String,
          required: true,
        },
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
          required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          }
      }, {
        timestamps: true,
      });


    productSchema.plugin(mongooseAggregatePaginate)
      export const Product= mongoose.model("Product",productSchema)