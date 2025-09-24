import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";


// To change role of a user
export const changeRoleToOwner = async (req, res) => {
    try {
        const { _id } = req.user;
        await User.findByIdAndUpdate(_id, { role: "owner" });
        res.json({ success: true, message: "Now you can list cars" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// To add car to the list
export const addCar = async (req, res) => {
    try {
        const { _id } = req.user;
        let car = JSON.parse(req.body.carData);

        const imageFile = req.file;
        
        // upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // optimization through imagekit url tranformation
        var optimizedImageURL = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '1280' },    // width resizing
                { quality: 'auto' },  // auto compression
                { format: 'webp' }    // convert to modern format
            ]
        });

        const image = optimizedImageURL;
        await Car.create({ ...car, owner: _id, image });

        res.json({ success: 'true', message: "Car added" });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// to list owner cars

export const getOwnersCars = async (req, res) => {
    try {
        const { _id } = req.user;
        const cars = await Car.find({ owner: _id });
        return res.json({ success: true, cars: cars });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//Toggle car Availability 

export const toggleCarAvailability = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);

        //checking is car available to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        car.isAvailable = !car.isAvailable;
        await car.save();

        res.json({ success: true, message: "Availability Toggled" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// To delete a car

export const deletecar = async (req, res) => {
    try {
        const { _id } = req.user;
        const { carId } = req.body;

        const car = await Car.findById(carId);

        //checking is car available to the user
        if (car.owner.toString() !== _id.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }
        
        car.owner=null;
        car.isAvailable = false;
        await car.save();

        res.json({ success: true, message: "Car Removed" });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// To get dashboard data

export const getDashboardData= async (req,res) =>{
    try {
        const{_id,role}=req.user;

        if(role!== 'owner') {
            return res.json({success:false,message:"Unauthorized"});
        }
        
        const cars=await Car.find({owner:_id})
        const bookings=await Booking.find({ owner:_id });
        const pendingBookings= await Booking.find({owner:_id , status:"pending"});
        const completedBookings= await Booking.find({owner:_id , status:"confirmed"});
 
        const monthlyRevenue = completedBookings.reduce((acc, booking) => acc + booking.price, 0);

        const dashboardData = {
            totalCars: cars.length,
            totalBookings: bookings.length,
            pendingBookings: pendingBookings.length,
            completedBookings: completedBookings.length,
            recentBookings: bookings.slice(0,3),
            monthlyRevenue
        }
        
        return res.json({success: true, dashboardData});

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Api to update user image

export const updateUserImage= async (req,res) => {
    try {
        
          const imageFile = req.file;
        
        // upload image to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        const response = await imagekit.upload({
            file: fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // optimization through imagekit url tranformation
        var optimizedImageURL = imagekit.url({
            path: response.filePath,
            transformation: [
                { width: '400' },    // width resizing
                { quality: 'auto' },  // auto compression
                { format: 'webp' }    // convert to modern format
            ]
        });
        const image = optimizedImageURL;
        await User.findByIdAndUpdate(req.user._id,{image});
        return res.json({success: true, message:"Image Updated"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}