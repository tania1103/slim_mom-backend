const Calorie = require('../models/Calorie');

const getDailyCalorieIntake = async (userId, date) => {
    try {
        const calorieData = await Calorie.findOne({ 
            userId, 
            date: {
                $gte: new Date(date).setHours(0,0,0,0),
                $lt: new Date(date).setHours(23,59,59,999)
            }
        }).populate('products.productId');
        return calorieData || { intake: 0, products: [] };
    } catch (error) {
        throw new Error('Error fetching daily calorie intake');
    }
};

const addCalorieEntry = async (userId, date, calorieEntry) => {
    try {
        const calorieData = await Calorie.findOneAndUpdate(
            { userId, date: new Date(date).setHours(0,0,0,0) },
            { 
                $push: { products: calorieEntry },
                $inc: { intake: calorieEntry.calories || 0 }
            },
            { new: true, upsert: true }
        ).populate('products.productId');
        return calorieData;
    } catch (error) {
        throw new Error('Error adding calorie entry');
    }
};

const deleteCalorieEntry = async (userId, date, productId) => {
    try {
        // Găsește intrarea pentru a obține caloriile
        const calorieDoc = await Calorie.findOne({ 
            userId, 
            date: new Date(date).setHours(0,0,0,0) 
        });
        
        if (!calorieDoc) {
            throw new Error('Calorie document not found');
        }
        
        const productToRemove = calorieDoc.products.find(p => p._id.toString() === productId);
        const caloriesToSubtract = productToRemove ? (productToRemove.calories || 0) : 0;
        
        const calorieData = await Calorie.findOneAndUpdate(
            { userId, date: new Date(date).setHours(0,0,0,0) },
            { 
                $pull: { products: { _id: productId } },
                $inc: { intake: -caloriesToSubtract }
            },
            { new: true }
        ).populate('products.productId');
        return calorieData;
    } catch (error) {
        throw new Error('Error deleting calorie entry');
    }
};

module.exports = {
    getDailyCalorieIntake,
    addCalorieEntry,
    deleteCalorieEntry,
};