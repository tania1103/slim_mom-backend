const Calorie = require('../models/Calorie'); // Assuming you have a Calorie model

const getDailyCalorieIntake = async (userId, date) => {
    try {
        const calorieData = await Calorie.findOne({ userId, date });
        return calorieData || { intake: 0, products: [] };
    } catch (error) {
        throw new Error('Error fetching daily calorie intake');
    }
};

const addCalorieEntry = async (userId, date, calorieEntry) => {
    try {
        const calorieData = await Calorie.findOneAndUpdate(
            { userId, date },
            { $push: { products: calorieEntry } },
            { new: true, upsert: true }
        );
        return calorieData;
    } catch (error) {
        throw new Error('Error adding calorie entry');
    }
};

const deleteCalorieEntry = async (userId, date, productId) => {
    try {
        const calorieData = await Calorie.findOneAndUpdate(
            { userId, date },
            { $pull: { products: { _id: productId } } },
            { new: true }
        );
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