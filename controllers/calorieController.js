const calorieService = require('../services/calorieService');

// Get daily calorie intake
exports.getDailyIntake = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.userId;
    
    const data = await calorieService.getDailyCalorieIntake(userId, date);
    res.status(200).json(data);
  } catch (error) {
    console.error('Get daily intake error:', error);
    res.status(500).json({ message: 'Error fetching daily intake', error: error.message });
  }
};

// Add calorie entry
exports.addEntry = async (req, res) => {
  try {
    const { date, productId, name, weight, calories } = req.body;
    const userId = req.user.userId;
    
    const calorieEntry = {
      productId,
      name,
      weight,
      calories
    };
    
    const data = await calorieService.addCalorieEntry(userId, date, calorieEntry);
    res.status(201).json({
      message: 'Calorie entry added successfully',
      data
    });
  } catch (error) {
    console.error('Add calorie entry error:', error);
    res.status(500).json({ message: 'Error adding calorie entry', error: error.message });
  }
};

// Delete calorie entry
exports.deleteEntry = async (req, res) => {
  try {
    const { date, productId } = req.params;
    const userId = req.user.userId;
    
    const data = await calorieService.deleteCalorieEntry(userId, date, productId);
    res.status(200).json({
      message: 'Calorie entry deleted successfully',
      data
    });
  } catch (error) {
    console.error('Delete calorie entry error:', error);
    res.status(500).json({ message: 'Error deleting calorie entry', error: error.message });
  }
};