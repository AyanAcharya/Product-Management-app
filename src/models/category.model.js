import moongoose,{Schema} from "mongoose"

const categorySchema=new Schema(
    {
        name: {
        type: String,
        required: true,
        unique: true,
      },
      image: {
        type: String,
        required: true,
      },
    }, {
      timestamps: true,
    });
     
export const Category = moongoose.model("Category",categorySchema)