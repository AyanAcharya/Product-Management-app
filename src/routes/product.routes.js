import { Router } from "express";
import { addProduct, updateProduct,filterProducts } from "../controllers/product.controller.js";
import {upload} from "../middlewares/multer.middleware.js"






const router=Router()




router.route("/additem").post(upload.fields([{name:"image",maxCount:1}]), addProduct)
router.route("/update/:id").put(upload.fields([{name:"image",maxCount:1}]), updateProduct)
router.route("/filter").get(filterProducts)




export default router