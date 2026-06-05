# Business Listings Dashboard

## Project Overview

Business Listings Dashboard is a full-stack web application developed to analyze and visualize business listing data through interactive charts and searchable records.

The project processes a large restaurant/business dataset, stores cleaned records in a MySQL database, exposes analytics APIs using FastAPI, and displays insights through a modern React dashboard.

---

## Features

### Data Processing
- Imported and processed 77,260+ business records from an Excel dataset
- Removed duplicate records
- Handled missing values
- Cleaned and standardized business information
- Generated sample phone numbers using Faker

### Database Management
- MySQL database integration
- Structured business listing storage
- Optimized schema for querying and analytics

### Backend APIs (FastAPI)
- City-wise business count
- Category-wise business count
- Source-wise business count
- Search functionality
- Pagination support
- City-specific analytics

### Frontend Dashboard (React)
- Interactive bar charts
- Interactive pie charts
- Search functionality
- Pagination
- Responsive design
- Dark/Light theme support
- CSV export functionality


---

## Technology Stack

### Frontend
- React.js
- Recharts
- Axios
- JavaScript
- CSS

### Backend
- FastAPI
- Python
- Pydantic

### Database
- MySQL

### Data Processing
- Pandas
- Faker
- OpenPyXL
---
## Technology Stack Summary

| Layer | Technology |
|---------|------------|
| Frontend | React.js |
| Backend | FastAPI |
| Database | MySQL |
| Data Processing | Pandas |
| Visualization | Recharts |
| API Testing | FastAPI Swagger UI |
| Version Control | Git & GitHub |
| Development Environment | VS Code |
---

## Project Architecture

Excel Dataset
↓
Data Cleaning & Preprocessing (Pandas)
↓
MySQL Database
↓
FastAPI Backend
↓
REST APIs
↓
React Dashboard

---

## Database Schema

### Table: listing_master

| Column Name | Data Type |
|-------------|------------|
| id | INT (Primary Key) |
| business_name | VARCHAR(255) |
| category | VARCHAR(500) |
| city | VARCHAR(255) |
| address | TEXT |
| phone | VARCHAR(50) |
| source | VARCHAR(500) |
| created_at | TIMESTAMP |

---

## API Endpoints

### 1. City-wise Business Count

GET /city-count

Returns the number of businesses grouped by city.

### 2. Category-wise Business Count

GET /category-count

Returns the number of businesses grouped by category.

### 3. Source-wise Business Count

GET /source-count

Returns the number of businesses grouped by source.

### 4. Listings API

GET /listings

Supports:
- Search
- Pagination

Example:

GET /listings?page=1&limit=15

### 5. City Details API

GET /city-details/{city}

Returns category breakdown for a selected city.

---

## Dataset Information

The dataset contains restaurant and business listing information including:

- Business Name
- Categories
- City
- Address
- Website
- Geographic Information
- Pricing Information

### Dataset Statistics

- Original Records: 77,260+
- Records After Cleaning: 17,408+
- Records Inserted into Database: 5,000

---

## Installation and Setup

### Step 1: Clone the Project

git clone <repository-url>

### Step 2: Install Backend Dependencies

pip install fastapi uvicorn pandas mysql-connector-python faker openpyxl

### Step 3: Create MySQL Database

CREATE DATABASE listings_db;

### Step 4: Configure Database Credentials

Update database.py with your MySQL credentials.

### Step 5: Load Data into Database

python generate_data.py

This script:
- Reads Excel data
- Cleans records
- Creates database table
- Inserts records into MySQL

### Step 6: Run FastAPI Backend

uvicorn main:app --reload

Backend URL:

http://127.0.0.1:8000

### Step 7: Install Frontend Dependencies

npm install

npm install axios recharts

### Step 8: Run React Application

npm start

Frontend URL:

http://localhost:3000

---

## Dashboard Insights

The dashboard provides valuable insights such as:

### Business Distribution by City
Displays cities with the highest number of business listings.

### Category Analysis
Shows the most common business categories.

### Source Distribution
Visualizes data sources contributing to business listings.

### Search and Exploration
Allows users to search businesses by:
- Name
- City
- Category

### Interactive Analytics
- Clickable charts
- Dynamic filtering
- Pagination support
- Real-time data retrieval

---

## Key Learning Outcomes

This project helped in understanding:

- Data Cleaning and Preprocessing
- SQL Database Design
- FastAPI Development
- REST API Design
- React Frontend Development
- Data Visualization
- Frontend-Backend Integration
- Full Stack Development
- Dashboard Creation
- Data Analytics

---

## Future Enhancements

- User Authentication
- Advanced Filters
- Interactive Maps
- Cloud Deployment
- Real-Time Data Updates
- Business Recommendation System
- Machine Learning Insights
- PDF Report Generation

---
## ⚠️ Challenges Faced
1. **NaN values in dataset** — Some columns had empty values
   that caused MySQL insertion errors. Fixed using pandas
   `fillna()` and `astype(str)`.

2. **CORS error** — React (port 3000) couldn't talk to FastAPI
   (port 8000). Fixed by adding CORSMiddleware in FastAPI.

3. **Column size error** — Some category text exceeded
   VARCHAR(100). Fixed by increasing to VARCHAR(500).


## Author

Hanshika Velaga

Data Science and Machine Learning Enthusiast

---

## Conclusion

Business Listings Dashboard demonstrates the complete workflow of a data-driven application, starting from raw data preprocessing to database storage, API development, and interactive visualization. The project showcases practical skills in Python, SQL, FastAPI, React, and Data Analytics while providing meaningful business insights through an intuitive dashboard.