from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import random, json
from datetime import date, timedelta
from datetime import datetime, date

app = Flask(__name__)
CORS(app)

CORS(app, resources={r"/api/*": {"origins": "*"}})


# -----------------------------
# DATABASE CONNECTION
# -----------------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="fitwise",
    ssl_disabled=True
)
cursor = db.cursor(dictionary=True)

# =====================================================
# AUTH
# =====================================================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    required = ["name", "email", "password", "age", "gender", "height_cm", "weight_kg"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "All fields required"}), 400

    cursor.execute("SELECT user_id FROM user WHERE email=%s", (data["email"],))
    if cursor.fetchone():
        return jsonify({"error": "Email exists"}), 409

    cursor.execute("""
        INSERT INTO user (name,email,password_hash,age,gender,height_cm,weight_kg, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s, NOW())
    """, (
        data["name"],
        data["email"],
        generate_password_hash(data["password"]),
        data["age"],
        data["gender"],
        data["height_cm"],
        data["weight_kg"]
    ))
    db.commit()
    return jsonify({"message": "Signup successful"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    cursor.execute("SELECT * FROM user WHERE email=%s", (data.get("email"),))
    user = cursor.fetchone()
    if not user or not check_password_hash(user["password_hash"], data.get("password", "")):
        return jsonify({"error": "Invalid credentials"}), 401

    cursor.execute("SELECT goal_type FROM goals WHERE user_id=%s ORDER BY created_at DESC LIMIT 1", (user["user_id"],))
    goal = cursor.fetchone()

    return jsonify({
        "user_id": user["user_id"],
        "name": user["name"],
        "age": user["age"],
        "gender": user["gender"],
        "height_cm": user["height_cm"],
        "weight_kg": user["weight_kg"],
        "goal": goal["goal_type"] if goal else None
    })

# =====================================================
# PROFILE + GOAL
# =====================================================
@app.route("/update-profile", methods=["POST"])
def update_profile():
    data = request.json or {}

    cursor.execute("UPDATE user SET height_cm=%s, weight_kg=%s WHERE user_id=%s",
                   (data["height_cm"], data["weight_kg"], data["user_id"]))
    cursor.execute("INSERT INTO goals (user_id, goal_type, created_at) VALUES (%s,%s,NOW())",
                   (data["user_id"], data["goal"]))
    db.commit()
    return jsonify({"message": "Profile updated"})


# =====================================================
# PLAN DATASETS
# =====================================================
WORKOUTS = {
    "weight loss": ["HIIT", "Brisk Walk", "Cycling"],
    "muscle gain": ["Push Pull Legs", "Upper Lower", "Full Body"],
    "general fitness": ["Mixed Cardio", "Mobility + Core"]
}

MEALS = {
    "vegetarian": ["Dal Rice", "Paneer Bowl", "Veg Upma"],
    "non-vegetarian": ["Chicken Rice", "Egg Omelette", "Fish Curry"]
}

HABITS = [
    "Drink 2-3L water",
    "Sleep 7-9 hours",
    "Stretch daily",
    "Track progress weekly"
]


@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    data = request.json or {}
    required = ["name", "age", "sex", "height", "weight", "goal"]
    if not all(data.get(k) for k in required):
        return jsonify({"error": "Missing required fields"}), 400

    name = data["name"]
    age = int(data["age"])
    gender = data["sex"].lower()
    height = float(data["height"])
    weight = float(data["weight"])
    goal = data.get("goal", "general fitness").lower()
    diet_pref = data.get("diet_pref", "vegetarian")
    days = int(data.get("days_per_week", 3))
    preferred_time = data.get("preferred_time", "morning")

    bmi = round(weight / ((height / 100) ** 2), 1)
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + (5 if gender == "male" else -161)
    tdee = int(bmr * 1.375)

    # Weekly workouts
    weekly_workouts = []
    for i in range(7):
        weekly_workouts.append({
            "day_index": i,
            "type": "workout" if i < days else "recovery",
            "name": random.choice(WORKOUTS.get(goal, WORKOUTS["general fitness"])),
            "duration_min": random.randint(30, 60),
            "intensity": "moderate"
        })

    # Weekly meals
    weekly_meals = []
    today = date.today()
    for i in range(7):
        weekly_meals.append({
            "date": (today + timedelta(days=i)).isoformat(),
            "meals": [
                {
                    "when": "Meal",
                    "item": random.choice(MEALS.get(diet_pref, MEALS["vegetarian"])),
                    "cal": 500
                }
            ]
        })

    plan = {
        "name": name,
        "age": age,
        "sex": gender,
        "weight_kg": weight,
        "height_cm": height,
        "BMI": bmi,
        "BMR_kcal": round(bmr),
        "TDEE_kcal": tdee,
        "calorie_target_kcal": tdee,
        "goal": goal,
        "days_per_week": days,
        "preferred_time": preferred_time,
        "weekly_workouts": weekly_workouts,
        "weekly_meals": weekly_meals,
        "habits": [
            "Drink 2–3L water daily",
            "Sleep 7–8 hours",
            "Warm up before workouts",
            "Stretch after exercise"
        ],
        "weekly_progress_guidelines": {
            "weight": "Track weekly",
            "strength": "Increase gradually",
            "recovery": "Rest when needed"
        },
        "notes": "This is an auto-generated plan. Adjust based on recovery."
    }

    cursor.execute("INSERT INTO personal_plans (name, goal, plan_json, created_at) VALUES (%s,%s,%s,NOW())",
                   (name, goal, json.dumps(plan)))
    db.commit()

    return jsonify({"status": "success", "plan": plan})

# ADMIN – FETCH USERS
@app.route("/admin/users", methods=["GET"])
def admin_users():
    cursor.execute("""
        SELECT user_id, name, email, age, gender, height_cm, weight_kg,
               IFNULL(created_at, NOW()) AS created_at
        FROM user
        ORDER BY user_id DESC
    """)
    rows = cursor.fetchall()
    # Ensure all required fields exist for frontend
    users = []
    for r in rows:
        users.append({
            "user_id": r["user_id"],
            "name": r["name"],
            "email": r["email"],
            "age": r["age"] or "",
            "gender": r["gender"] or "",
            "height_cm": r["height_cm"] or "",
            "weight_kg": r["weight_kg"] or "",
            "created_at": r["created_at"].isoformat() if isinstance(r["created_at"], (date,)) else str(r["created_at"]),
            "activity": {},
            "limitations": {"max_searches": 0}
        })
    return jsonify(users)


# ADMIN – FETCH PLANS
@app.route("/admin/plans", methods=["GET"])
def admin_plans():
    cursor.execute("""
        SELECT id, name, goal, created_at, plan_json
        FROM personal_plans ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    plans = []
    for r in rows:
        plans.append({
            "id": r["id"],
            "name": r["name"],
            "goal": r["goal"],
            "created_at": r["created_at"].isoformat() if isinstance(r["created_at"], (date,)) else str(r["created_at"]),
            "plan": json.loads(r["plan_json"])
        })
    return jsonify(plans)

# =====================================================
# ADMIN – ADD & DELETE USERS/PLANS
# =====================================================
@app.route("/admin/add_user", methods=["POST"])
def admin_add_user():
    data = request.json or {}
    required = ["name", "email", "password", "age", "gender", "height_cm", "weight_kg", "limitations"]
    if not all(k in data for k in required):
        return jsonify({"error": "All fields required"}), 400

    cursor.execute("SELECT user_id FROM user WHERE email=%s", (data["email"],))
    if cursor.fetchone():
        return jsonify({"error": "Email exists"}), 409

    cursor.execute("""
        INSERT INTO user (name,email,password_hash,age,gender,height_cm,weight_kg, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
    """, (
        data["name"], data["email"], generate_password_hash(data["password"]),
        data["age"], data["gender"], data["height_cm"], data["weight_kg"]
    ))
    db.commit()
    user_id = cursor.lastrowid

    return jsonify({
        "user_id": user_id,
        "name": data["name"],
        "email": data["email"],
        "age": data["age"],
        "gender": data["gender"],
        "height_cm": data["height_cm"],
        "weight_kg": data["weight_kg"],
        "activity": {},
        "limitations": data["limitations"]
    })


@app.route("/admin/user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    cursor.execute("DELETE FROM user WHERE user_id=%s", (user_id,))
    db.commit()
    return jsonify({"status": "deleted"})


@app.route("/admin/plan/<int:plan_id>", methods=["DELETE"])
def delete_plan(plan_id):
    cursor.execute("DELETE FROM personal_plans WHERE id=%s", (plan_id,))
    db.commit()
    return jsonify({"status": "deleted"})


if __name__ == "__main__":
    app.run(debug=True)



# ===========================
# DB MANAGER ROUTES
# ===========================

from datetime import datetime, date

# -----------------------------
# FETCH ALL USERS
# -----------------------------
@app.route("/admin/users", methods=["GET"])
def db_users():
    cursor.execute("""
        SELECT user_id, name, email, age, gender, height_cm, weight_kg,
               IFNULL(created_at, NOW()) AS created_at
        FROM user ORDER BY user_id DESC
    """)
    rows = cursor.fetchall()
    users = []
    for r in rows:
        users.append({
            "user_id": r["user_id"],
            "name": r["name"],
            "email": r["email"],
            "age": r["age"] or "",
            "gender": r["gender"] or "",
            "height_cm": r["height_cm"] or "",
            "weight_kg": r["weight_kg"] or "",
            "created_at": r["created_at"].isoformat() if isinstance(r["created_at"], (datetime, date)) else str(r["created_at"]),
            "activity": {},
            "limitations": {"max_searches": 0}
        })
    return jsonify(users)


# -----------------------------
# FETCH ALL PLANS
# -----------------------------
@app.route("/admin/plans", methods=["GET"])
def db_plans():
    cursor.execute("""
        SELECT id, name, goal, created_at, plan_json
        FROM personal_plans ORDER BY id DESC
    """)
    rows = cursor.fetchall()
    plans = []
    for r in rows:
        plans.append({
            "id": r["id"],
            "name": r["name"],
            "goal": r["goal"],
            "created_at": r["created_at"].isoformat() if isinstance(r["created_at"], (datetime, date)) else str(r["created_at"]),
            "plan": json.loads(r["plan_json"]) if r["plan_json"] else {}
        })
    return jsonify(plans)


# -----------------------------
# ADD USER
# -----------------------------
@app.route("/admin/add_user", methods=["POST"])
def db_add_user():
    data = request.json or {}
    required = ["name", "email", "password", "age", "gender", "height_cm", "weight_kg"]
    if not all(k in data and data[k] for k in required):
        return jsonify({"error": "All fields required"}), 400

    cursor.execute("SELECT user_id FROM user WHERE email=%s", (data["email"],))
    if cursor.fetchone():
        return jsonify({"error": "Email exists"}), 409

    cursor.execute("""
        INSERT INTO user (name,email,password_hash,age,gender,height_cm,weight_kg, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
    """, (
        data["name"], data["email"], generate_password_hash(data["password"]),
        data["age"], data["gender"], data["height_cm"], data["weight_kg"]
    ))
    db.commit()
    user_id = cursor.lastrowid

    return jsonify({
        "user_id": user_id,
        "name": data["name"],
        "email": data["email"],
        "age": data["age"],
        "gender": data["gender"],
        "height_cm": data["height_cm"],
        "weight_kg": data["weight_kg"],
        "activity": {},
        "limitations": {"max_searches": 0}
    })


# -----------------------------
# DELETE USER
# -----------------------------
@app.route("/admin/user/<int:user_id>", methods=["DELETE"])
def db_delete_user(user_id):
    cursor.execute("DELETE FROM user WHERE user_id=%s", (user_id,))
    db.commit()
    return jsonify({"status": "deleted"})


# -----------------------------
# DELETE PLAN
# -----------------------------
@app.route("/admin/plan/<int:plan_id>", methods=["DELETE"])
def db_delete_plan(plan_id):
    cursor.execute("DELETE FROM personal_plans WHERE id=%s", (plan_id,))
    db.commit()
    return jsonify({"status": "deleted"})


