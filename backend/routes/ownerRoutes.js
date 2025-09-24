import express from "express"
import { protect } from "../middlewares/auth.js";
import { addCar, changeRoleToOwner, deletecar, getDashboardData, getOwnersCars, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middlewares/multer.js";

const ownerRouter= express.Router();

ownerRouter.post("/change-role",protect,changeRoleToOwner);
ownerRouter.post("/add-car",upload.single("image"),protect,addCar); 
ownerRouter.get("/cars",protect,getOwnersCars);
ownerRouter.post("/toggle-car",protect,toggleCarAvailability); 
ownerRouter.post("/delete-car",protect,deletecar);  
ownerRouter.get("/dashboard",protect,getDashboardData);  
ownerRouter.post("/update-image",upload.single("image"), protect, updateUserImage);

export default ownerRouter;