#database.py — PostgreSQL

import psycopg2
import psycopg2.extras
import hashlib
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
def get_connection():
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f" Database connection error: {e}")
        return None

def hash_password(password):
    
    return hashlib.sha256(password.encode()).hexdigest()

def signup_user(username, email, password):
    
    if len(username) < 3:
        return False, " Username must be at least 3 characters!"
    if len(password) < 6:
        return False, "Password must be at least 6 characters!"
    if "@" not in email:
        return False, "Please enter a valid email!"

    conn = get_connection()
    if not conn:
        return False, "Database connection failed!"

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users 
            (username, email, password, created_at, reviews_count)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            username,
            email,
            hash_password(password),
            datetime.now(),
            0
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return True, "Account created successfully!"

    except psycopg2.errors.UniqueViolation as e:
        conn.rollback()
        conn.close()
        if "username" in str(e):
            return False, "Username already exists!"
        elif "email" in str(e):
            return False, "Email already registered!"
        return False, "Account creation failed!"

    except Exception as e:
        conn.close()
        return False, f"Error: {str(e)}"

def signin_user(username, password):
   
    conn = get_connection()
    if not conn:
        return False, "Database connection failed!"

    try:
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute(
            "SELECT * FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return False, " Username not found!"
        if user["password"] != hash_password(password):
            return False, " Wrong password!"

        return True, "Login successful!"

    except Exception as e:
        conn.close()
        return False, f"Login error: {str(e)}"

def get_user_info(username):
    
    conn = get_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute(
            "SELECT * FROM users WHERE username = %s",
            (username,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return dict(user) if user else None

    except Exception as e:
        conn.close()
        return None

def update_review_count(username):
    
    conn = get_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users
            SET reviews_count = reviews_count + 1
            WHERE username = %s
        """, (username,))
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error updating count: {e}")
        conn.close()

def save_review_history(username, mode, language, code, result):
    
    conn = get_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reviews
            (username, mode, language, code_snippet, result, reviewed_at)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            username,
            mode,
            language,
            code[:500],
            result[:2000],
            datetime.now()
        ))
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error saving review: {e}")
        conn.close()

def get_user_reviews(username):
    
    conn = get_connection()
    if not conn:
        return []

    try:
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )
        cursor.execute("""
            SELECT * FROM reviews
            WHERE username = %s
            ORDER BY reviewed_at DESC
            LIMIT 10
        """, (username,))
        reviews = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(r) for r in reviews]

    except Exception as e:
        conn.close()
        return []

def save_topic_learned(username, topic_name):
    
    conn = get_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO topics_learned (username, topic_name, learned_at, times_viewed)
            VALUES (%s, %s, %s, 1)
            ON CONFLICT DO NOTHING
        """, (username, topic_name, datetime.now()))
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error saving topic: {e}")
        conn.close()

def save_bug_history(username, original_code, bugs_found, language):
    
    conn = get_connection()
    if not conn:
        return

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO bug_history
            (username, original_code, bugs_found, language, created_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            username,
            original_code[:500],
            bugs_found,
            language,
            datetime.now()
        ))
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        print(f"Error saving bug history: {e}")
        conn.close()

def get_total_users():
    
    conn = get_connection()
    if not conn:
        return 0

    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count

    except Exception as e:
        conn.close()
        return 0
    
def get_user_progress(username):
    
    conn = get_connection()
    if not conn:
        return None

    try:
        cursor = conn.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        # Total reviews
        cursor.execute(
            "SELECT COUNT(*) as total FROM reviews WHERE username = %s",
            (username,)
        )
        total_reviews = cursor.fetchone()["total"]

        
        cursor.execute(
            "SELECT COUNT(*) as total FROM reviews WHERE username = %s AND mode = 'Bug Finder'",
            (username,)
        )
        bugs_fixed = cursor.fetchone()["total"]

        
        cursor.execute(
            "SELECT COUNT(*) as total FROM topics_learned WHERE username = %s",
            (username,)
        )
        topics_count = cursor.fetchone()["total"]

        
        cursor.execute(
            "SELECT COUNT(*) as total FROM reviews WHERE username = %s AND mode = 'Interview Evaluator'",
            (username,)
        )
        interviews_done = cursor.fetchone()["total"]

        
        cursor.execute("""
            SELECT
                DATE(reviewed_at) as date,
                COUNT(*) as count
            FROM reviews
            WHERE username = %s
            AND reviewed_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(reviewed_at)
            ORDER BY date ASC
        """, (username,))
        daily_activity = []
        for row in cursor.fetchall():
            daily_activity.append({
                "date": str(row["date"]),
                "count": row["count"]
            })

        
        cursor.execute("""
            SELECT mode, COUNT(*) as count
            FROM reviews
            WHERE username = %s
            GROUP BY mode
        """, (username,))
        mode_breakdown = []
        for row in cursor.fetchall():
            mode_breakdown.append({
                "mode": row["mode"],
                "count": row["count"]
            })

        
        cursor.execute("""
            SELECT mode, language, reviewed_at
            FROM reviews
            WHERE username = %s
            ORDER BY reviewed_at DESC
            LIMIT 5
        """, (username,))
        recent_reviews = []
        for row in cursor.fetchall():
            recent_reviews.append({
                "mode": row["mode"],
                "language": row["language"],
                "reviewed_at": str(row["reviewed_at"])
            })

        cursor.close()
        conn.close()

        return {
            "total_reviews": total_reviews,
            "bugs_fixed": bugs_fixed,
            "topics_learned": topics_count,
            "interviews_done": interviews_done,
            "daily_activity": daily_activity,
            "mode_breakdown": mode_breakdown,
            "recent_reviews": recent_reviews
        }

    except Exception as e:
        print(f"Error getting progress: {e}")
        if conn:
            conn.close()
        return None