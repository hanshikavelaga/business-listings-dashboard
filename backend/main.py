from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
from database import get_connection


# Create FastAPI app
app = FastAPI()

# Allow React to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# API 1 - City wise count
@app.get("/city-count")
def city_count():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT city, COUNT(*) as count 
        FROM listing_master 
        GROUP BY city 
        ORDER BY count DESC
    """)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

# API 2 - Category wise count
@app.get("/category-count")
def category_count():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT category, COUNT(*) as count 
        FROM listing_master 
        GROUP BY category 
        ORDER BY count DESC
    """)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

# API 3 - Source wise count
@app.get("/source-count")
def source_count():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT source, COUNT(*) as count 
        FROM listing_master 
        GROUP BY source 
        ORDER BY count DESC
    """)
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

@app.get("/listings")
def get_listings(
    search: str = "",
    page: int = 1,
    limit: int = 15
):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    offset = (page - 1) * limit

    query = """
    SELECT *
    FROM listing_master
    WHERE business_name LIKE %s
       OR city LIKE %s
       OR category LIKE %s
    LIMIT %s OFFSET %s
    """

    search_term = f"%{search}%"

    cursor.execute(
        query,
        (search_term, search_term, search_term, limit, offset)
    )

    data = cursor.fetchall()

    cursor.execute(
        """
        SELECT COUNT(*) as total
        FROM listing_master
        WHERE business_name LIKE %s
           OR city LIKE %s
           OR category LIKE %s
        """,
        (search_term, search_term, search_term)
    )

    total = cursor.fetchone()["total"]

    cursor.close()
    conn.close()

    return {
        "data": data,
        "total": total
    }

@app.get("/city-details/{city}")
def city_details(city: str):

    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT category,
               COUNT(*) as count
        FROM listing_master
        WHERE city = %s
        GROUP BY category
        ORDER BY count DESC
        LIMIT 10
        """,
        (city,)
    )

    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result