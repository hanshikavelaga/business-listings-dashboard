import mysql.connector

def get_connection():
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='MySql@2026',  # ← replace this!
        database='listings_db'
    )
    return conn