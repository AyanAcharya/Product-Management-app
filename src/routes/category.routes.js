import { Router } from "express";
import  { addCategory,showCategories} from "../controllers/category.controller.js";
import {upload} from "../middlewares/multer.middleware.js" 


const router=Router()




router.route("/add").post( upload.fields([{name:"image",maxCount:1}]),addCategory)
router.route("/allcategory").get(showCategories)





export default router