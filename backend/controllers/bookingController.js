import Car from "../models/Car.js";
import Booking from "../models/Booking.js";

// Function to check the availability of car for a given date
export const checkAvailability= async (car,pickupDate,returnDate) => {
    const bookings=await Booking.find({
        car,
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    });
    return bookings.length ===0;
}

// Function to check the availability of cars for a given date and location

export const checkAvailabilityOfCar = async (req,res)=> {
    try {
        const {location, pickupDate,returnDate}= req.body;

        //fetch all available cars in given location
        const cars=await Car.find({location, isAvailable: true})

        //check cars availability for the given date range using promise
        const availableCarPromises=cars.map(async (car) => {
            const isAvailable= await checkAvailability(car._id, pickupDate,returnDate);
            return {...car._doc,isAvailable: isAvailable }
        })

        let availableCars= await Promise.all(availableCarPromises);
        availableCars= availableCars.filter(car => car.isAvailable==true);
        return res.json({success:true,availableCars});

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

// for creating booking

export const createBooking = async (req,res)=> {
    try {
        const {_id}= req.user;
        const {car,pickupDate,returnDate} = req.body;

        const isAvailable=await checkAvailability(car,pickupDate,returnDate);
        if(!isAvailable) {
            return res.json({success:false,message:"Car not available for the selected dates."});
        }

        const carData = await Car.findById(car);

        // calculate price based on pickUpDate and returnDate
        const picked= new Date(pickupDate);
        const returned= new Date(returnDate);
        const noOfDays= Math.ceil((returned - picked)/(1000*60*60*24));
        const price= carData.pricePerDay* noOfDays; 

        await Booking.create({car,owner: carData.owner, user: _id, pickupDate,returnDate,price});
        res.json({success: true,message:"Booking Created"});
         

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

// API to list  User Bookings

export const getUserBookings = async(req,res)=> {
    try {
        const{_id}=req.user;
        const bookings = await Booking.find({ user:_id }).populate("car").sort({ createdAt: -1 })
        res.json({success: true, bookings});

    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

// To get Owner Bookings
export const getOwnerBookings = async(req,res)=> {
    try {
        if(req.user.role !== 'owner') {
            return res.json({ success:false, message: "Unauthorized" })
        }
        const bookings= await Booking.find({ owner:req.user._id }).populate('car user').select("-user.password").sort({createdAt: -1});
        res.json({success: true, bookings});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}

// To change Booking status

export const changeBookingStatus = async(req,res)=> {
    try {
        const {_id}=req.user; 
        const {bookingId,status}= req.body;

        const booking= await Booking.findById(bookingId);

        if(booking.owner.toString() !== _id.toString()) {
            return res.json({ success:false, message:"Unauthorised" });
        }
        booking.status= status;
        await booking.save();

        res.json({ success:true, message: "Status Updated" });
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
    }
}
