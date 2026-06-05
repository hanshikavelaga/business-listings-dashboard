import pandas as pd
import mysql.connector
from faker import Faker
import random

# Part 1 - Setting up Faker
fake = Faker('en_IN')

# Part 2 - Reading the Excel file
print("Reading Excel file...")
df = pd.read_excel('../dataset/just tacos and burritos.xlsx')
print(f"Total rows loaded: {len(df)}")

# Part 3 - Keeping only needed columns
df = df[['name', 'categories', 'city', 'address', 'websites']].copy()

# Part 4 - Renaming columns
df.columns = ['business_name', 'category', 'city', 'address', 'source']

# Part 5 - Removing empty rows
df = df.dropna(subset=['business_name', 'city'])
print(f"After removing empty rows: {len(df)}")

# Part 6 - Removing duplicates
df = df.drop_duplicates(subset=['business_name', 'city'])
print(f"After removing duplicates: {len(df)}")

# Part 7 - Fill remaining empty cells with default values
# Part 7 - Fill ALL empty cells in entire dataframe at once
df = df.fillna({
    'business_name': 'Unknown Business',
    'category': 'General',
    'city': 'Unknown City',
    'address': 'Address not available',
    'source': 'Google Maps'
})

# Convert everything to string to avoid nan sneaking in
df['business_name'] = df['business_name'].astype(str)
df['category'] = df['category'].astype(str)
df['city'] = df['city'].astype(str)
df['address'] = df['address'].astype(str)
df['source'] = df['source'].astype(str)

print("Empty cells filled! ✅")

# Part 8 - Trim long text to fit column sizes
df['business_name'] = df['business_name'].str[:250]
df['category'] = df['category'].str[:490]
df['city'] = df['city'].str[:250]
df['phone'] = df['phone'] if 'phone' in df.columns else None
df['source'] = df['source'].str[:490]

# Part 9 - Taking 5000 rows
df = df.head(5000)
print(f"Final rows to insert: {len(df)}")

# Part 10 - Adding fake phone numbers
df['phone'] = [fake.phone_number()[:15] for _ in range(len(df))]

# Part 11 - Connecting to MySQL
print("Connecting to MySQL...")
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='MySql@2026',  # ← replace this!
    database='listings_db'
)
cursor = conn.cursor()
print("Connected to MySQL! ✅")

# Part 12 - Drop old table if exists
cursor.execute('DROP TABLE IF EXISTS listing_master')
print("Old table dropped! ✅")

# Part 13 - Creating the table with bigger column sizes
cursor.execute('''
CREATE TABLE IF NOT EXISTS listing_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255),
    category VARCHAR(500),
    city VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    source VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')
print("Table created! ✅")

# Part 14 - Preparing records for MySQL
print("Preparing data for insertion...")
records = list(df[['business_name', 'category', 'city',
                    'address', 'phone', 'source']
                   ].itertuples(index=False, name=None))
print(f"Records ready: {len(records)}")

# Part 15 - Inserting into MySQL
print("Inserting records into MySQL...")
cursor.executemany('''
INSERT INTO listing_master 
(business_name, category, city, address, phone, source)
VALUES (%s, %s, %s, %s, %s, %s)
''', records)

# Part 16 - Saving and closing
conn.commit()
print(f"✅ {cursor.rowcount} records inserted into MySQL!")
cursor.close()
conn.close()
print("Connection closed! ✅")
print("DATABASE IS READY! 🎉")