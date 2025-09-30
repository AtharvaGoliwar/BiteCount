import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timedelta
from bson import ObjectId

# Load environment variables from .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "calorie_tracker_db"

def setup_database():
    """
    Connects to MongoDB, drops existing collections for a clean slate,
    and seeds the database with initial data for all necessary collections.
    """
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        print("Successfully connected to MongoDB.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        return

     # --- 1. Clean Up Existing Collections ---
    print("Dropping existing collections for a fresh start...")
    db.foods.drop()
    db.daily_logs.drop()
    db.weight_logs.drop()
    db.activity_logs.drop() # <-- ADD THIS LINE
    print("Dropped collections: foods, daily_logs, weight_logs, activity_logs.")
    print("-" * 20)


    # --- 2. The `foods` Collection ---
    # This collection is the master list of all available food items.
    # It's used for searching in the "Log Food" page.
    print("Seeding the 'foods' collection...")
    foods_collection = db.foods
    
    initial_foods = [
        {
            "_id": ObjectId(),
            "name": "Apple",
            "type": "Fruit",
            "serving_size": "1 medium (182g)",
            "calories": 95,
            "macros": {"protein": 0.5, "carbs": 25, "fat": 0.3}
        },
        {
            "_id": ObjectId(),
            "name": "Grilled Chicken Breast",
            "type": "Meat",
            "serving_size": "100g",
            "calories": 165,
            "macros": {"protein": 31, "carbs": 0, "fat": 3.6}
        },
        {
            "_id": ObjectId(),
            "name": "Brown Rice",
            "type": "Grain",
            "serving_size": "1 cup cooked (195g)",
            "calories": 215,
            "macros": {"protein": 5, "carbs": 45, "fat": 1.8}
        },
        {
            "_id": ObjectId(),
            "name": "Almonds",
            "type": "Nuts",
            "serving_size": "1 ounce (28g)",
            "calories": 164,
            "macros": {"protein": 6, "carbs": 6.1, "fat": 14.2}
        },
        {
            "_id": ObjectId(),
            "name": "Broccoli",
            "type": "Vegetable",
            "serving_size": "1 cup chopped (91g)",
            "calories": 31,
            "macros": {"protein": 2.5, "carbs": 6, "fat": 0.3}
        }
    ]
    foods_collection.insert_many(initial_foods)
    print(f"Inserted {len(initial_foods)} documents into 'foods'.")
    print("-" * 20)


    # --- 3. The `daily_logs` Collection ---
    # This collection stores every instance of a food being logged on a specific date.
    # It powers the Dashboard summary and the calorie progress chart.
    print("Seeding the 'daily_logs' collection with sample data for the past 5 days...")
    daily_logs_collection = db.daily_logs
    
    sample_daily_logs = []
    # Let's create some data for the last 5 days to make the charts look good
    for i in range(5):
        log_date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        
        # Log chicken and rice for each of the last 5 days
        chicken = initial_foods[1]
        rice = initial_foods[2]
        
        # Log 1.5 servings of chicken
        servings_chicken = 1.5
        sample_daily_logs.append({
            "food_id": chicken['_id'],
            "name": chicken['name'],
            "servings": servings_chicken,
            "date": log_date,
            "total_calories": chicken['calories'] * servings_chicken,
            "total_macros": {
                "protein": chicken['macros']['protein'] * servings_chicken,
                "carbs": chicken['macros']['carbs'] * servings_chicken,
                "fat": chicken['macros']['fat'] * servings_chicken
            }
        })
        
        # Log 1 serving of rice
        servings_rice = 1
        sample_daily_logs.append({
            "food_id": rice['_id'],
            "name": rice['name'],
            "servings": servings_rice,
            "date": log_date,
            "total_calories": rice['calories'] * servings_rice,
            "total_macros": {
                "protein": rice['macros']['protein'] * servings_rice,
                "carbs": rice['macros']['carbs'] * servings_rice,
                "fat": rice['macros']['fat'] * servings_rice
            }
        })
    
    # Add an apple for today's log as well
    today_date = datetime.now().strftime('%Y-%m-%d')
    apple = initial_foods[0]
    servings_apple = 1
    sample_daily_logs.append({
            "food_id": apple['_id'],
            "name": apple['name'],
            "servings": servings_apple,
            "date": today_date,
            "total_calories": apple['calories'] * servings_apple,
            "total_macros": {
                "protein": apple['macros']['protein'] * servings_apple,
                "carbs": apple['macros']['carbs'] * servings_apple,
                "fat": apple['macros']['fat'] * servings_apple
            }
        })

    daily_logs_collection.insert_many(sample_daily_logs)
    print(f"Inserted {len(sample_daily_logs)} documents into 'daily_logs'.")
    print("-" * 20)


    # --- 4. The `weight_logs` Collection ---
    # This collection stores weight entries over time.
    # It is used to render the weight progress chart.
    print("Seeding the 'weight_logs' collection with sample data...")
    weight_logs_collection = db.weight_logs
    
    sample_weight_logs = []
    base_weight = 75.0
    for i in range(7): # Data for the last week
        log_date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
        # Simulate small weight fluctuations
        current_weight = base_weight - (i * 0.15) + ((-1)**i * 0.1) 
        sample_weight_logs.append({
            "date": log_date,
            "weight": round(current_weight, 2)
        })

    # Data is inserted in reverse chronological order, but the API will sort it.
    weight_logs_collection.insert_many(sample_weight_logs)
    print(f"Inserted {len(sample_weight_logs)} documents into 'weight_logs'.")
    print("-" * 20)

    # --- 5. The `activity_logs` Collection ---
    # This collection stores calories burned through activity on a specific date.
    print("Seeding the 'activity_logs' collection with sample data...")
    activity_logs_collection = db.activity_logs
    
    sample_activity_logs = [
        {"date": (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'), "calories_burned": 350},
        {"date": (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d'), "calories_burned": 410},
    ]
    activity_logs_collection.insert_many(sample_activity_logs)
    print(f"Inserted {len(sample_activity_logs)} documents into 'activity_logs'.")
    print("-" * 20)
    
    print("\nDatabase setup and seeding complete!")





if __name__ == "__main__":
    setup_database()