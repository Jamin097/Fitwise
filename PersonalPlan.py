from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# -----------------------------
# Database connection
# -----------------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="fitwise"
)
cursor = db.cursor(dictionary=True)

# -----------------------------
# SIGNUP
# -----------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    age = data.get("age")
    gender = data.get("gender")
    height_cm = data.get("height_cm")
    weight_kg = data.get("weight_kg")

    if not all([name, email, password, age, gender, height_cm, weight_kg]):
        return jsonify({"error": "All fields are required"}), 400

    cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({"error": "Email already exists"}), 409

    password_hash = generate_password_hash(password)

    cursor.execute("""
        INSERT INTO user
        (name, email, password_hash, age, gender, height_cm, weight_kg)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (name, email, password_hash, age, gender, height_cm, weight_kg))

    db.commit()
    return jsonify({"message": "Signup successful"}), 201


# -----------------------------
# LOGIN
# -----------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    cursor.execute("""
        SELECT goal_type
        FROM goals
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (user["user_id"],))
    goal = cursor.fetchone()

    return jsonify({
        "user_id": user["user_id"],
        "name": user["name"],
        "email": user["email"],
        "age": user["age"],
        "gender": user["gender"],
        "height_cm": user["height_cm"],
        "weight_kg": user["weight_kg"],
        "goal": goal["goal_type"] if goal else None
    })


# -----------------------------
# SAVE PLAN (NO GENERATION)
# -----------------------------
@app.route("/save-plan", methods=["POST"])
def save_plan():
    data = request.json or {}

    user_id = data.get("user_id")
    plan_type = data.get("plan_type")   # veg / nonveg
    plan_name = data.get("plan_name")   # custom name

    if not all([user_id, plan_type, plan_name]):
        return jsonify({"error": "Missing required fields"}), 400

    cursor.execute("""
        INSERT INTO plans (user_id, plan_type, plan_name)
        VALUES (%s, %s, %s)
    """, (user_id, plan_type, plan_name))

    db.commit()

    return jsonify({
        "message": "Plan saved successfully",
        "plan": {
            "user_id": user_id,
            "plan_type": plan_type,
            "plan_name": plan_name
        }
    }), 201


# -----------------------------
# UPDATE PROFILE + GOAL
# -----------------------------
@app.route("/update-profile", methods=["POST"])
def update_profile():
    data = request.json or {}

    user_id = data.get("user_id")
    height_cm = data.get("height_cm")
    weight_kg = data.get("weight_kg")
    goal = data.get("goal")

    if not all([user_id, height_cm, weight_kg, goal]):
        return jsonify({"error": "Missing required fields"}), 400

    cursor.execute("""
        UPDATE user
        SET height_cm = %s,
            weight_kg = %s
        WHERE user_id = %s
    """, (height_cm, weight_kg, user_id))

    cursor.execute("""
        INSERT INTO goals (user_id, goal_type)
        VALUES (%s, %s)
    """, (user_id, goal))

    db.commit()
    return jsonify({"message": "Profile & goal updated successfully"}), 200


# -----------------------------
# GENERATE PLAN
# -----------------------------
@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    cursor.execute("SELECT * FROM user WHERE user_id = %s", (user_id,))
    user = cursor.fetchone()

    if not user:
        return jsonify({"error": "User not found"}), 404

    cursor.execute("""
        SELECT goal_type
        FROM goals
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id,))
    goal_data = cursor.fetchone()

    if not goal_data:
        return jsonify({"error": "Goal not set"}), 400

    height = user["height_cm"]
    weight = user["weight_kg"]
    age = user["age"]
    gender = user["gender"].strip().lower()
    goal = goal_data["goal_type"].strip().lower()

    bmi = round(weight / ((height / 100) ** 2), 1)

    bmr = (
        (10 * weight) +
        (6.25 * height) -
        (5 * age) +
        (5 if gender == "male" else -161)
    )

    tdee = int(bmr * 1.375)

    calories = (
        tdee - 300 if goal == "weight loss"
        else tdee + 300 if goal == "muscle gain"
        else tdee
    )

    return jsonify({
        "status": "success",
        "plan": {
            "user": user["name"],
            "goal": goal,
            "BMI": bmi,
            "BMR": round(bmr),
            "TDEE": tdee,
            "calorie_target": calories
        }
    })


if __name__ == "__main__":
    app.run(debug=True)
