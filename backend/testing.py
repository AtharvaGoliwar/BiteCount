import requests
import json
from datetime import datetime

# The base URL of your running Flask application
BASE_URL = "http://localhost:5001/api"
HEADERS = {'Content-Type': 'application/json'}

def print_response(title, response):
    """Helper function to print API responses in a readable format."""
    print("\n" + "="*50)
    print(f"[*] TESTING: {title}")
    print(f"URL: {response.url}")
    print(f"Status Code: {response.status_code}")
    try:
        # Pretty-print the JSON response
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except json.JSONDecodeError:
        # If response is not JSON, print as text
        print("Response Body (Non-JSON):")
        print(response.text)
    print("="*50 + "\n")


def run_tests():
    """
    Runs a sequence of API requests and prints the results.
    """
    try:
        # --- 1. Add a new food item ---
        new_food = {
            "name": "Avocado",
            "serving_size": "100g",
            "calories": 160,
            "macros": {"protein": 2, "carbs": 9, "fat": 15}
        }
        response = requests.post(f"{BASE_URL}/foods", data=json.dumps(new_food), headers=HEADERS)
        print_response("Add a New Food (Avocado)", response)
        
        # We need the ID of the new food for the next steps
        if response.status_code == 201:
            food_id_to_log = response.json().get('id')
        else:
            print("[!] Failed to add food. Cannot proceed with logging tests.")
            return

        # --- 2. Search for the food we just added ---
        response = requests.get(f"{BASE_URL}/foods?q=Avocado")
        print_response("Search for 'Avocado'", response)

        # --- 3. Search for a food that doesn't exist ---
        response = requests.get(f"{BASE_URL}/foods?q=nonexistentfood")
        print_response("Search for a Non-Existent Food", response)

        # --- 4. Log the new food for today ---
        today_str = datetime.now().strftime('%Y-%m-%d')
        log_entry = {
            "food_id": food_id_to_log,
            "servings": 1.5,
            "date": today_str
        }
        response = requests.post(f"{BASE_URL}/log/food", data=json.dumps(log_entry), headers=HEADERS)
        print_response("Log 1.5 Servings of Avocado for Today", response)

        # --- 5. Get the daily summary for today ---
        response = requests.get(f"{BASE_URL}/summary/{today_str}")
        print_response("Get Daily Summary for Today", response)

        # --- 6. Log a weight entry for today ---
        weight_entry = {"weight": 74.8, "date": today_str}
        response = requests.post(f"{BASE_URL}/log/weight", data=json.dumps(weight_entry), headers=HEADERS)
        print_response("Log Weight for Today", response)

        # --- 7. Get all weight progress ---
        response = requests.get(f"{BASE_URL}/progress/weight")
        print_response("Get Weight Progress History", response)
        
        # --- 8. Get calorie progress (last 30 days) ---
        response = requests.get(f"{BASE_URL}/progress/calories")
        print_response("Get Calorie Progress (Last 30 Days)", response)
        
        # --- 9. Check the progress status ---
        response = requests.get(f"{BASE_URL}/progress/check")
        print_response("Check Progress Status Notification", response)

    except requests.exceptions.ConnectionError as e:
        print("\n[!!!] CONNECTION ERROR [!!!]")
        print("Could not connect to the Flask server.")
        print("Please make sure your backend application is running on http://localhost:5001")


if __name__ == "__main__":
    run_tests()