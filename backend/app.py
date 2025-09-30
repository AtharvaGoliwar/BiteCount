# backend/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId, json_util
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import json
import jwt
from functools import wraps
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Allow requests from your React app's origin
# CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
CORS(app)
# --- FIX: ADD THE SECRET KEY TO THE APP CONFIG ---
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("No SECRET_KEY set for Flask application")
# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "calorie_tracker_db"
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
users_collection = db['users']
bcrypt = Bcrypt(app)

# --- Helper to serialize MongoDB ObjectId ---
def parse_json(data):
    return json.loads(json_util.dumps(data))

# --- API Routes ---
# 0. User Authentication
# --- Authentication Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated


# --- Routes ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'message': 'Missing fields'}), 400

    if users_collection.find_one({'email': email}):
        return jsonify({'message': 'User with this email already exists'}), 409

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a basic profile on registration
    user_id = users_collection.insert_one({
        'name': name,
        'email': email,
        'password_hash': hashed_password,
        'profile': {
            'height_cm': 0,
            'weight_kg': 0,
            'target_weight_kg': 0,
            'daily_calories_goal': 2000 # Default value
        }
    }).inserted_id

    return jsonify({'message': 'User registered successfully!', 'user_id': str(user_id)}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Could not verify'}), 401

    user = users_collection.find_one({'email': email})

    if user and bcrypt.check_password_hash(user['password_hash'], password):
        token = jwt.encode({
            'user_id': str(user['_id']),
            "exp": datetime.utcnow() + timedelta(hours=24) # Token expires in 24 hours
        }, app.config['SECRET_KEY'], algorithm="HS256")

        return jsonify({'token': token})

    return jsonify({'message': 'Could not verify! Wrong email or password.'}), 401

# --- Profile Routes (Protected) ---

@app.route('/api/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    # Don't send the password hash to the frontend
    user_data = {
        'name': current_user['name'],
        'email': current_user['email'],
        'profile': current_user.get('profile', {})
    }
    return jsonify(user_data)

@app.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Fields that can be updated
    update_data = {
        'name': data.get('name', current_user['name']),
        'profile.height_cm': data.get('profile', {}).get('height_cm', current_user['profile']['height_cm']),
        'profile.weight_kg': data.get('profile', {}).get('weight_kg', current_user['profile']['weight_kg']),
        'profile.target_weight_kg': data.get('profile', {}).get('target_weight_kg', current_user['profile']['target_weight_kg']),
        'profile.daily_calories_goal': data.get('profile', {}).get('daily_calories_goal', current_user['profile']['daily_calories_goal'])
    }
    
    users_collection.update_one(
        {'_id': current_user['_id']},
        {'$set': update_data}
    )

    return jsonify({'message': 'Profile updated successfully!'})

@app.route('/api/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'message': 'Missing fields'}), 400

    if not bcrypt.check_password_hash(current_user['password_hash'], old_password):
        return jsonify({'message': 'Old password is not correct!'}), 401

    new_hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    users_collection.update_one(
        {'_id': current_user['_id']},
        {'$set': {'password_hash': new_hashed_password}}
    )

    return jsonify({'message': 'Password updated successfully!'})

# 1. Food Management
@app.route('/api/foods', methods=['GET'])
def search_foods():
    query = request.args.get('q', '')
    # Case-insensitive search
    foods = db.foods.find({"name": {"$regex": query, "$options": 'i'}}).limit(20)
    return parse_json(list(foods))

@app.route('/api/foods', methods=['POST'])
def add_food():
    data = request.json
    food = {
        "name": data['name'],
        "type": data.get('type', 'General'),
        "serving_size": data['serving_size'],
        "calories": float(data['calories']),
        "macros": {
            "protein": float(data['macros'].get('protein', 0)),
            "carbs": float(data['macros'].get('carbs', 0)),
            "fat": float(data['macros'].get('fat', 0)),
        }
    }
    result = db.foods.insert_one(food)
    return jsonify({"message": "Food added successfully", "id": str(result.inserted_id)}), 201

# 2. Daily Logging
@app.route('/api/log/food', methods=['POST'])
@token_required # MODIFIED: Protect this route
def log_food_entry(current_user): # MODIFIED: Get the current user
    data = request.json
    food_id = data['food_id']
    servings = float(data['servings'])
    log_date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # MODIFIED: Ensure the food item belongs to the current user
    food_item = db.foods.find_one({"_id": ObjectId(food_id)})
    if not food_item:
        return jsonify({"error": "Food not found or does not belong to user"}), 404
        
    log_entry = {
        "user_id": current_user['_id'], # MODIFIED: Add the user's ID
        "food_id": ObjectId(food_id),
        "name": food_item['name'],
        "servings": servings,
        "date": log_date_str,
        "total_calories": food_item['calories'] * servings,
        "total_macros": {
            "protein": food_item['macros']['protein'] * servings,
            "carbs": food_item['macros']['carbs'] * servings,
            "fat": food_item['macros']['fat'] * servings
        }
    }
    db.daily_logs.insert_one(log_entry)
    return jsonify({"message": "Food logged successfully"}), 201

@app.route('/api/log/weight', methods=['POST'])
@token_required # MODIFIED: Protect this route
def log_weight_entry(current_user): # MODIFIED: Get the current user
    data = request.json
    weight = float(data['weight'])
    log_date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))

    db.weight_logs.update_one(
        # MODIFIED: Find by user_id AND date
        {"user_id": current_user['_id'], "date": log_date_str},
        # MODIFIED: Set the user_id on creation
        {"$set": {"user_id": current_user['_id'], "weight": weight, "date": log_date_str}},
        upsert=True
    )
    return jsonify({"message": "Weight logged successfully"}), 201

@app.route('/api/log/activity', methods=['POST'])
@token_required # MODIFIED: Protect this route
def log_activity(current_user): # MODIFIED: Get the current user
    data = request.json
    calories_burned = float(data['calories_burned'])
    log_date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))

    db.activity_logs.update_one(
        # MODIFIED: Find by user_id AND date
        {"user_id": current_user['_id'], "date": log_date_str},
        # MODIFIED: Set the user_id on creation
        {"$set": {"user_id": current_user['_id'], "calories_burned": calories_burned, "date": log_date_str}},
        upsert=True
    )
    return jsonify({"message": "Activity logged successfully"}), 201

# 3. Progress and Summary
@app.route('/api/summary/<date_str>', methods=['GET'])
@token_required # MODIFIED: Protect this route
def get_daily_summary(current_user, date_str): # MODIFIED: Get the current user
    # MODIFIED: Filter food logs by user_id
    logs = db.daily_logs.find({"user_id": current_user['_id'], "date": date_str})
    
    total_calories = 0
    logged_foods = []
    for log in logs:
        total_calories += log['total_calories']
        logged_foods.append(parse_json(log))

    # MODIFIED: Filter activity log by user_id
    activity_log = db.activity_logs.find_one({"user_id": current_user['_id'], "date": date_str})
    calories_burned = activity_log['calories_burned'] if activity_log else 0

    return jsonify({
        "date": date_str,
        "total_calories": round(total_calories, 2),
        "calories_burned": round(calories_burned, 2),
        "logged_foods": logged_foods
    })
@app.route('/api/progress/weight', methods=['GET'])
@token_required # MODIFIED: Protect this route
def get_weight_progress(current_user): # MODIFIED: Get the current user
    # MODIFIED: Filter by user_id
    logs = db.weight_logs.find({"user_id": current_user['_id']}).sort("date", 1)
    return parse_json(list(logs))

@app.route('/api/progress/calories', methods=['GET'])
@token_required # MODIFIED: Protect this route
def get_calorie_progress(current_user): # MODIFIED: Get the current user
    # MODIFIED: Add a $match stage for user_id at the beginning of the pipeline
    thirty_days_ago = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    pipeline = [
        {"$match": {
            "user_id": current_user['_id'],
            "date": {"$gte": thirty_days_ago}
        }},
        {"$group": {"_id": "$date", "total_calories": {"$sum": "$total_calories"}}},
        {"$sort": {"_id": 1}}
    ]
    logs = db.daily_logs.aggregate(pipeline)
    return parse_json(list(logs))

@app.route('/api/month-summary/<int:year>/<int:month>', methods=['GET'])
@token_required # MODIFIED: Protect this route
def get_month_summary(current_user, year, month): # MODIFIED: Get the current user
    # MODIFIED: Use the user's specific calorie goal from their profile
    TARGET_CALORIES = current_user.get('profile', {}).get('daily_calories_goal', 2000)

    start_date_str = f"{year}-{month:02d}-01"
    next_month = month + 1 if month < 12 else 1
    next_year = year if month < 12 else year + 1
    end_date = datetime(next_year, next_month, 1) - timedelta(days=1)
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    pipeline = [
        # MODIFIED: Add a $match stage for user_id at the beginning
        {"$match": {
            "user_id": current_user['_id'],
            "date": {"$gte": start_date_str, "$lte": end_date_str}
        }},
        {"$group": {"_id": "$date", "total_calories": {"$sum": "$total_calories"}}},
        {"$project": {
            "date": "$_id",
            "total_calories": 1,
            "status": {
                "$cond": {
                    "if": {"$lte": ["$total_calories", TARGET_CALORIES]},
                    "then": "success", "else": "failure"
                }
            },
            "_id": 0
        }},
        {"$sort": {"date": 1}}
    ]
    daily_summaries = list(db.daily_logs.aggregate(pipeline))
    summary_map = {item['date']: item['status'] for item in daily_summaries}
    return jsonify(summary_map)

# 4. Progress Check Feature
@app.route('/api/progress/check', methods=['GET'])
@token_required # MODIFIED: Protect this route
def check_progress(current_user): # MODIFIED: Get the current user
    # MODIFIED: Use the user's specific calorie goal
    TARGET_CALORIES = current_user.get('profile', {}).get('daily_calories_goal', 2000)
    
    seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    pipeline = [
        # MODIFIED: Match for user_id
        {"$match": {
            "user_id": current_user['_id'],
            "date": {"$gte": seven_days_ago}
        }},
        {"$group": {"_id": None, "avg_calories": {"$avg": "$total_calories"}}}
    ]
    result = list(db.daily_logs.aggregate(pipeline))
    
    if not result or not result[0].get('avg_calories'):
        return jsonify({"on_track": "unknown", "message": "Not enough data to check your progress. Keep logging!"})

    avg_calories = result[0]['avg_calories']
    
    if avg_calories <= TARGET_CALORIES:
        return jsonify({"on_track": True, "message": f"Great job! Your average intake of {int(avg_calories)} kcal is on track with your goal of {TARGET_CALORIES} kcal."})
    else:
        return jsonify({"on_track": False, "message": f"Heads up! Your average intake of {int(avg_calories)} kcal is a bit above your goal of {TARGET_CALORIES} kcal."})


if __name__ == '__main__':
    app.run(debug=True, port=5001)