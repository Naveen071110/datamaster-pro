import type { CodeSnippet } from "@/shared/types/content"

export const snippets: CodeSnippet[] = [
  // SQL - SELECT
  {
    id: "sql-select-01",
    title: "Basic SELECT with filtering",
    description: "Retrieve specific columns with a WHERE filter, sorted by a column.",
    code: "SELECT name, department, salary\nFROM employees\nWHERE department = 'Engineering'\nORDER BY salary DESC;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "select",
    tags: ["SELECT", "WHERE", "ORDER BY"], usage: "Use for any basic data retrieval with conditions.",
    relatedSnippets: ["sql-join-01", "sql-agg-01"],
  },
  {
    id: "sql-select-02",
    title: "Pagination with LIMIT/OFFSET",
    description: "Paginate through results with limit and offset.",
    code: "SELECT * FROM employees\nORDER BY id\nLIMIT 10 OFFSET 20;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "select",
    tags: ["pagination", "LIMIT", "OFFSET"], usage: "Use for paginated API endpoints or report pages.",
    relatedSnippets: [],
  },
  {
    id: "sql-select-03",
    title: "DISTINCT values",
    description: "Get unique values from a column.",
    code: "SELECT DISTINCT department FROM employees ORDER BY department;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "select",
    tags: ["DISTINCT", "unique"], usage: "Use to enumerate unique categories or values in a column.",
    relatedSnippets: [],
  },
  // SQL - JOIN
  {
    id: "sql-join-01",
    title: "INNER JOIN two tables",
    description: "Join two tables on a common key, returning only matching records.",
    code: "SELECT c.name, o.order_date, o.total\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'delivered';",
    language: "sql", tool: "sql", difficulty: "beginner", category: "join",
    tags: ["INNER JOIN", "JOIN"], usage: "Use when you need records that exist in both tables.",
    relatedSnippets: ["sql-join-02", "sql-join-03"],
  },
  {
    id: "sql-join-02",
    title: "LEFT JOIN with NULL check",
    description: "Find records in the left table that have no match in the right table.",
    code: "SELECT c.name, c.email\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "join",
    tags: ["LEFT JOIN", "anti-join", "NULL"], usage: "Use to find orphaned records or missing relationships.",
    relatedSnippets: ["sql-join-01"],
  },
  {
    id: "sql-join-03",
    title: "Multi-table JOIN",
    description: "Join three or more tables to create a comprehensive dataset.",
    code: "SELECT c.name AS customer, p.name AS product, o.quantity, o.total\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nJOIN products p ON o.product_id = p.product_id\nWHERE o.status = 'delivered';",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "join",
    tags: ["multi-table", "JOIN"], usage: "Use when your data spans more than two related tables.",
    relatedSnippets: ["sql-join-01", "sql-join-02"],
  },
  {
    id: "sql-join-04",
    title: "SELF JOIN for hierarchies",
    description: "Join a table to itself to find parent-child relationships.",
    code: "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON e.manager_id = m.id\nORDER BY m.name;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "join",
    tags: ["SELF JOIN", "hierarchy"], usage: "Use for organizational charts, categories, or any self-referencing data.",
    relatedSnippets: [],
  },
  // SQL - Transform
  {
    id: "sql-transform-01",
    title: "CASE expression for conditional logic",
    description: "Use CASE to create computed columns with conditional logic.",
    code: "SELECT name, salary,\n  CASE\n    WHEN salary >= 95000 THEN 'High'\n    WHEN salary >= 75000 THEN 'Medium'\n    ELSE 'Standard'\n  END AS salary_tier\nFROM employees\nORDER BY salary DESC;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["CASE", "conditional"], usage: "Use for data categorization, bucket analysis, or conditional transformations.",
    relatedSnippets: [],
  },
  {
    id: "sql-transform-02",
    title: "Date truncation and bucketing",
    description: "Group date-based data into buckets (daily, monthly, yearly).",
    code: "SELECT strftime('%Y-%m', order_date) AS month,\n       COUNT(*) AS order_count,\n       ROUND(SUM(total), 2) AS revenue\nFROM orders\nGROUP BY month\nORDER BY month;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["date", "strftime", "aggregation"], usage: "Use for time-series analysis and reporting by time period.",
    relatedSnippets: [],
  },
  {
    id: "sql-transform-03",
    title: "String aggregation (GROUP_CONCAT)",
    description: "Concatenate values from multiple rows into a single string.",
    code: "SELECT department,\n       GROUP_CONCAT(name, ', ') AS employees_list\nFROM employees\nGROUP BY department;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["GROUP_CONCAT", "string"], usage: "Use when you need a comma-separated list from grouped data.",
    relatedSnippets: [],
  },
  // SQL - Load
  {
    id: "sql-load-01",
    title: "INSERT with SELECT (CTAS)",
    description: "Insert results from a SELECT query into a table — the foundation of ETL loads.",
    code: "INSERT INTO department_summary (department, emp_count, avg_salary)\nSELECT department,\n       COUNT(*),\n       ROUND(AVG(salary), 2)\nFROM employees\nGROUP BY department;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "load",
    tags: ["INSERT", "SELECT", "CTAS"], usage: "Use for populating summary tables or staging transformed data.",
    relatedSnippets: ["sql-load-03"],
  },
  {
    id: "sql-load-02",
    title: "Bulk INSERT with multiple rows",
    description: "Insert multiple rows in a single statement for efficiency.",
    code: "INSERT INTO products (product_id, name, category, price, stock) VALUES\n  (1008, 'Wireless Mouse', 'Electronics', 34.99, 200),\n  (1009, 'USB Hub', 'Electronics', 24.99, 150),\n  (1010, 'Desk Lamp', 'Accessories', 49.99, 100);",
    language: "sql", tool: "sql", difficulty: "beginner", category: "load",
    tags: ["INSERT", "bulk"], usage: "Use for batch data ingestion. Much faster than individual INSERT statements.",
    relatedSnippets: ["sql-load-01"],
  },
  {
    id: "sql-load-03",
    title: "MERGE / UPSERT pattern",
    description: "Insert or update based on whether a record already exists.",
    code: "INSERT INTO employees (id, name, department, salary, hire_date, email)\nVALUES (26, 'Alex Rivera', 'Engineering', 92000, '2024-03-15', 'alex@example.com')\nON CONFLICT(id) DO UPDATE SET\n  name = excluded.name,\n  department = excluded.department,\n  salary = excluded.salary;",
    language: "sql", tool: "sql", difficulty: "advanced", category: "load",
    tags: ["UPSERT", "MERGE", "ON CONFLICT"], usage: "Use for incremental loads where records may already exist.",
    relatedSnippets: ["sql-load-01"],
  },
  {
    id: "sql-load-04",
    title: "DELETE with JOIN (cleanup pattern)",
    description: "Delete rows from one table based on conditions in another.",
    code: "DELETE FROM orders\nWHERE order_id IN (\n  SELECT order_id FROM orders o\n  LEFT JOIN customers c ON o.customer_id = c.customer_id\n  WHERE c.customer_id IS NULL\n);",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "load",
    tags: ["DELETE", "cleanup", "data quality"], usage: "Use for cleaning up orphaned records after data loads.",
    relatedSnippets: [],
  },
  // SQL - Data Quality
  {
    id: "sql-dq-01",
    title: "Null check and COALESCE",
    description: "Detect and handle NULL values in your data.",
    code: "-- Find rows with null values\nSELECT COUNT(*) FROM employees WHERE email IS NULL;\n\n-- Replace nulls with default\nSELECT name, COALESCE(email, 'no-email@example.com') AS email\nFROM employees;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "data-quality",
    tags: ["NULL", "COALESCE", "data quality"], usage: "Use in data validation checks and to provide defaults for missing data.",
    relatedSnippets: [],
  },
  {
    id: "sql-dq-02",
    title: "Data profiling: min, max, nulls per column",
    description: "Quickly profile a table to understand data distribution.",
    code: "SELECT\n  COUNT(*) AS total_rows,\n  SUM(CASE WHEN name IS NULL THEN 1 ELSE 0 END) AS null_names,\n  SUM(CASE WHEN email IS NULL THEN 1 ELSE 0 END) AS null_emails,\n  MIN(salary) AS min_salary,\n  MAX(salary) AS max_salary,\n  ROUND(AVG(salary), 0) AS avg_salary\nFROM employees;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "data-quality",
    tags: ["profiling", "data quality"], usage: "Use as an ETL pre-check before loading data into target systems.",
    relatedSnippets: ["sql-dq-01"],
  },
  {
    id: "sql-dq-03",
    title: "Duplicate detection",
    description: "Find rows that share values in key columns.",
    code: "SELECT email, COUNT(*) AS dup_count\nFROM employees\nGROUP BY email\nHAVING COUNT(*) > 1\nORDER BY dup_count DESC;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "data-quality",
    tags: ["duplicate", "data quality"], usage: "Use to identify and dedup records before loading into target tables.",
    relatedSnippets: ["sql-dq-02"],
  },
  // SQL - Extract
  {
    id: "sql-ext-01",
    title: "Full table extraction",
    description: "Extract all data with row version tracking.",
    code: "SELECT *, CURRENT_TIMESTAMP AS extracted_at\nFROM source_table\nWHERE updated_at > '2024-01-01';\n\n-- With high-water mark\nSELECT * FROM source_table\nWHERE id > 1000;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "extract",
    tags: ["extract", "CDC"], usage: "Use for initial full loads or timestamp-based incremental extraction.",
    relatedSnippets: ["sql-ext-02"],
  },
  {
    id: "sql-ext-02",
    title: "Incremental extraction with watermark",
    description: "Extract only new/changed records since the last run.",
    code: "-- Assume last_max_id = 1250 from previous run\nSELECT * FROM orders\nWHERE order_id > 1250\nORDER BY order_id;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "extract",
    tags: ["incremental", "watermark", "extract"], usage: "Use for efficient incremental loads. Maintain the watermark value in a control table.",
    relatedSnippets: ["sql-ext-01"],
  },
  // Python snippets
  {
    id: "py-etl-01",
    title: "Pandas read/write CSV",
    description: "Read from CSV, transform, and write to another CSV or database.",
    code: `import pandas as pd
from sqlalchemy import create_engine

# Read source
df = pd.read_csv('source_data.csv')

# Transform
df['load_date'] = pd.Timestamp.now()
df['amount'] = df['amount'].fillna(0)
df = df.drop_duplicates(subset=['id'])

# Write to database
engine = create_engine('postgresql://user:pass@host/db')
df.to_sql('target_table', engine, if_exists='append', index=False)

print(f"Loaded {len(df)} rows")`,
    language: "python", tool: "python", difficulty: "intermediate", category: "load",
    tags: ["pandas", "CSV", "ETL"], usage: "Use for simple file-based ETL tasks with basic transformations.",
    relatedSnippets: ["py-etl-02"],
  },
  {
    id: "py-etl-02",
    title: "Error handling in ETL pipeline",
    description: "Robust ETL with error handling, logging, and retry logic.",
    code: `import logging
import time
from functools import wraps

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    logger.warning(f"Attempt {attempt+1} failed: {e}")
                    if attempt == max_attempts - 1:
                        raise
                    time.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator

@retry(max_attempts=3)
def extract_from_source():
    # Simulated extraction
    raise ConnectionError("Timeout")
    return ["data1", "data2"]  # noqa

def run_etl():
    try:
        data = extract_from_source()
        logger.info(f"Extracted {len(data)} records")
    except Exception as e:
        logger.error(f"ETL failed: {e}")
        raise`,
    language: "python", tool: "python", difficulty: "advanced", category: "testing",
    tags: ["error handling", "retry", "Python"], usage: "Use for production ETL pipelines where reliability is critical.",
    relatedSnippets: ["py-etl-01"],
  },
  {
    id: "py-etl-03",
    title: "Data validation with Pydantic",
    description: "Validate data types and constraints before loading.",
    code: `from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import date

class Employee(BaseModel):
    id: int
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    department: str
    salary: float = Field(..., gt=0)
    hire_date: date

def validate_records(records: list[dict]) -> tuple[list, list]:
    valid, errors = [], []
    for i, rec in enumerate(records):
        try:
            valid.append(Employee(**rec))
        except Exception as e:
            errors.append({"row": i, "error": str(e), "data": rec})
    return valid, errors`,
    language: "python", tool: "python", difficulty: "intermediate", category: "data-quality",
    tags: ["validation", "Pydantic", "Python"], usage: "Use for schema validation in ETL pipelines before loading data.",
    relatedSnippets: [],
  },
  // dbt snippets
  {
    id: "dbt-01",
    title: "dbt model with CTEs and transformations",
    description: "Clean dbt model using CTE pattern for readability.",
    code: `-- models/department_summary.sql
WITH source AS (
    SELECT * FROM {{ ref('stg_employees') }}
),

department_stats AS (
    SELECT
        department,
        COUNT(*) AS employee_count,
        ROUND(AVG(salary), 2) AS avg_salary,
        ROUND(MAX(salary), 2) AS max_salary,
        ROUND(MIN(salary), 2) AS min_salary
    FROM source
    GROUP BY department
)

SELECT * FROM department_stats`,
    language: "sql", tool: "dbt", difficulty: "intermediate", category: "transform",
    tags: ["dbt", "model", "CTE"], usage: "Use in dbt projects for well-structured, documented data transformations.",
    relatedSnippets: ["dbt-02", "dbt-03"],
  },
  {
    id: "dbt-02",
    title: "dbt test for data quality",
    description: "Write custom dbt tests to validate data quality.",
    code: `-- tests/assert_positive_order_total.sql
-- Assert that all order totals are positive

SELECT order_id, total
FROM {{ ref('orders') }}
WHERE total <= 0`,
    language: "sql", tool: "dbt", difficulty: "intermediate", category: "data-quality",
    tags: ["dbt", "test", "data quality"], usage: "Use in dbt projects to enforce data quality rules as code.",
    relatedSnippets: ["dbt-01"],
  },
  {
    id: "dbt-03",
    title: "dbt incremental model",
    description: "Efficient incremental load pattern with dbt.",
    code: `{{ config(
    materialized='incremental',
    unique_key='order_id',
    incremental_strategy='merge'
) }}

WITH source AS (
    SELECT * FROM {{ source('raw', 'orders') }}
    {% if is_incremental() %}
    WHERE updated_at > (SELECT MAX(updated_at) FROM {{ this }})
    {% endif %}
)

SELECT
    order_id,
    customer_id,
    product_id,
    quantity,
    total,
    status,
    updated_at
FROM source`,
    language: "sql", tool: "dbt", difficulty: "advanced", category: "load",
    tags: ["dbt", "incremental", "merge"], usage: "Use for large tables where full refresh is impractical.",
    relatedSnippets: ["dbt-01"],
  },
  // Airflow snippets
  {
    id: "airflow-01",
    title: "Basic Airflow DAG",
    description: "Simple DAG with PythonOperator and dependencies.",
    code: `from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    dag_id='daily_etl_pipeline',
    default_args=default_args,
    schedule='0 1 * * *',
    start_date=datetime(2024, 1, 1),
    catchup=False,
) as dag:

    extract = BashOperator(
        task_id='extract_data',
        bash_command='python /scripts/extract.py',
    )

    transform = PythonOperator(
        task_id='transform_data',
        python_callable=lambda: print("Transform complete"),
    )

    load = BashOperator(
        task_id='load_to_dw',
        bash_command='python /scripts/load.py',
    )

    extract >> transform >> load`,
    language: "python", tool: "airflow", difficulty: "intermediate", category: "orchestration",
    tags: ["Airflow", "DAG", "orchestration"], usage: "Use as a template for any scheduled ETL pipeline orchestration.",
    relatedSnippets: ["airflow-02"],
  },
  {
    id: "airflow-02",
    title: "Airflow dependent tasks with branching",
    description: "DAG with task branching based on data quality checks.",
    code: `from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.dummy import DummyOperator

def check_data_quality():
    row_count = 1500  # Simulated
    if row_count > 1000:
        return 'process_data'
    return 'skip_pipeline'

with DAG(dag_id='quality_gated_etl', ...) as dag:
    start = DummyOperator(task_id='start')

    quality_check = BranchPythonOperator(
        task_id='quality_check',
        python_callable=check_data_quality,
    )

    process = DummyOperator(task_id='process_data')
    skip = DummyOperator(task_id='skip_pipeline')

    start >> quality_check >> [process, skip]`,
    language: "python", tool: "airflow", difficulty: "advanced", category: "orchestration",
    tags: ["Airflow", "branching", "quality gate"], usage: "Use when your pipeline needs conditional execution based on data checks.",
    relatedSnippets: ["airflow-01"],
  },
  // Spark snippets
  {
    id: "spark-01",
    title: "Spark DataFrame read and transform",
    description: "Read from Parquet, perform transformations, write to Delta.",
    code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, avg, count
from pyspark.sql.window import Window

spark = SparkSession.builder.appName("ETL").getOrCreate()

# Read source
df = spark.read.parquet("s3://data-lake/raw/orders/")

# Transform
transformed = (df
    .filter(col("status") == "delivered")
    .withColumn("year", col("order_date").cast("year"))
    .groupBy("year", "customer_id")
    .agg(
        count("*").alias("order_count"),
        avg("total").alias("avg_order_value")
    ))

# Write to Delta
transformed.write.format("delta").mode("append").save("s3://data-lake/dw/orders_summary/")`,
    language: "python", tool: "spark", difficulty: "advanced", category: "transform",
    tags: ["Spark", "DataFrame", "Parquet"], usage: "Use for large-scale data processing in distributed environments.",
    relatedSnippets: ["spark-02"],
  },
  {
    id: "spark-02",
    title: "Spark structured streaming",
    description: "Real-time stream processing with Spark Structured Streaming.",
    code: `from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window
from pyspark.sql.types import StructType, StructField, StringType, DoubleType

schema = StructType([
    StructField("event_id", StringType()),
    StructField("amount", DoubleType()),
    StructField("timestamp", StringType()),
])

spark = SparkSession.builder.appName("StreamingETL").getOrCreate()

stream = (spark
    .readStream
    .format("kafka")
    .option("subscribe", "transactions")
    .load()
    .select(from_json(col("value").cast("string"), schema).alias("data"))
    .select("data.*")
    .withWatermark("timestamp", "10 minutes")
    .groupBy(window("timestamp", "5 minutes"))
    .agg({"amount": "sum"}))

query = (stream
    .writeStream
    .format("console")
    .outputMode("append")
    .start())

query.awaitTermination()`,
    language: "python", tool: "spark", difficulty: "advanced", category: "orchestration",
    tags: ["Spark", "streaming", "Kafka"], usage: "Use for real-time data pipelines with Kafka or other streaming sources.",
    relatedSnippets: ["spark-01"],
  },
  // YAML configs
  {
    id: "yaml-01",
    title: "dbt project configuration",
    description: "dbt_project.yml with sources and model configuration.",
    code: `# dbt_project.yml
name: 'data_pipeline'
version: '1.0.0'
profile: 'default'

model-paths: ["models"]
test-paths: ["tests"]
seed-paths: ["seeds"]

models:
  data_pipeline:
    staging:
      +materialized: view
      +schema: staging
    marts:
      +materialized: table
      +schema: marts
      +tags: ["production"]

seeds:
  +schema: seed_data
  +quote_columns: true`,
    language: "yaml", tool: "dbt", difficulty: "intermediate", category: "extract",
    tags: ["dbt", "YAML", "configuration"], usage: "Use as the base configuration for any dbt project setup.",
    relatedSnippets: ["dbt-01"],
  },
  {
    id: "yaml-02",
    title: "Kafka Connect connector config",
    description: "Configuration for a Kafka Connect JDBC source connector.",
    code: "{\n  \"name\": \"jdbc-source-orders\",\n  \"config\": {\n    \"connector.class\": \"io.confluent.connect.jdbc.JdbcSourceConnector\",\n    \"connection.url\": \"jdbc:postgresql://host:5432/db\",\n    \"connection.user\": \"${file:/secrets:user}\",\n    \"connection.password\": \"${file:/secrets:password}\",\n    \"table.whitelist\": \"orders\",\n    \"mode\": \"incrementing\",\n    \"incrementing.column.name\": \"order_id\",\n    \"topic.prefix\": \"raw-\",\n    \"poll.interval.ms\": \"60000\",\n    \"transforms\": \"TimestampConverter\",\n    \"transforms.TimestampConverter.type\": \"org.apache.kafka.connect.transforms.TimestampConverter$Value\",\n    \"transforms.TimestampConverter.format\": \"yyyy-MM-dd HH:mm:ss\",\n    \"transforms.TimestampConverter.field\": \"order_date\"\n  }\n}",
    language: "json", tool: "kafka", difficulty: "advanced", category: "extract",
    tags: ["Kafka", "Kafka Connect", "CDC"], usage: "Use for CDC extraction from databases into Kafka topics.",
    relatedSnippets: [],
  },
  // YAML Airflow
  {
    id: "yaml-03",
    title: "Airflow connection config",
    description: "Environment variables for Airflow connections.",
    code: "# .env for Airflow connections\nAIRFLOW_CONN_POSTGRES_ETL=postgresql://user:pass@host:5432/etl_db\nAIRFLOW_CONN_SNOWFLAKE_DW=snowflake://user:pass@account/db?warehouse=COMPUTE_WH\nAIRFLOW_CONN_AWS_S3=s3://access_key:secret_key@?region=us-east-1\n\n# Variables set via Admin > Variables\n# etl_last_run = \"2024-01-15T03:00:00Z\"\n# max_retry_count = 3\n# alert_email = \"data-team@company.com\"",
    language: "bash", tool: "airflow", difficulty: "beginner", category: "orchestration",
    tags: ["Airflow", "configuration", "environment"], usage: "Use to configure external system connections in Airflow deployment.",
    relatedSnippets: ["airflow-01"],
  },
  // Additional SQL snippets
  {
    id: "sql-win-01",
    title: "Window function: running total",
    description: "Calculate a running total within ordered partitions.",
    code: "SELECT date, amount,\n       SUM(amount) OVER (ORDER BY date) AS running_total\nFROM transactions\nORDER BY date;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["window function", "running total", "SUM"], usage: "Use for cumulative financial reporting or inventory tracking.",
    relatedSnippets: ["sql-win-02"],
  },
  {
    id: "sql-win-02",
    title: "Window function: moving average",
    description: "Calculate a 3-period moving average.",
    code: "SELECT date, amount,\n       AVG(amount) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3d\nFROM transactions\nORDER BY date;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["window function", "moving average", "AVG"], usage: "Use for smoothing trends in time-series data.",
    relatedSnippets: ["sql-win-01"],
  },
  {
    id: "sql-win-03",
    title: "FIRST_VALUE / LAST_VALUE",
    description: "Access the first/last value in a window frame.",
    code: "SELECT date, amount,\n       FIRST_VALUE(amount) OVER (ORDER BY date) AS first_amount,\n       LAST_VALUE(amount) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_amount\nFROM transactions\nORDER BY date;",
    language: "sql", tool: "sql", difficulty: "advanced", category: "transform",
    tags: ["FIRST_VALUE", "LAST_VALUE", "window function"], usage: "Use to compare each row against baseline or final values.",
    relatedSnippets: ["sql-win-01"],
  },
  {
    id: "sql-cte-01",
    title: "Recursive CTE for date range",
    description: "Generate a series of dates using recursive CTE.",
    code: "WITH RECURSIVE dates(date) AS (\n  SELECT '2024-01-01' AS date\n  UNION ALL\n  SELECT DATE(date, '+1 day')\n  FROM dates\n  WHERE date < '2024-01-10'\n)\nSELECT * FROM dates;",
    language: "sql", tool: "sql", difficulty: "advanced", category: "transform",
    tags: ["recursive CTE", "date series"], usage: "Use to fill gaps in date-sparse data for complete reporting.",
    relatedSnippets: ["sql-cte-02"],
  },
  {
    id: "sql-cte-02",
    title: "Multiple CTEs for pipeline pattern",
    description: "Build a transformation pipeline using multiple CTEs.",
    code: "WITH\nextract AS (\n  SELECT * FROM orders WHERE order_date >= '2024-01-01'\n),\ntransform AS (\n  SELECT customer_id, COUNT(*) AS order_count, SUM(total) AS total_spent\n  FROM extract\n  GROUP BY customer_id\n),\nload AS (\n  SELECT c.name, t.order_count, t.total_spent\n  FROM transform t\n  JOIN customers c ON t.customer_id = c.customer_id\n  ORDER BY t.total_spent DESC\n)\nSELECT * FROM load;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["CTE", "pipeline", "ETL"], usage: "Use for multi-stage transformations mirroring an ETL pipeline within SQL.",
    relatedSnippets: ["sql-cte-01"],
  },
  {
    id: "sql-index-01",
    title: "Create covering index",
    description: "Create an index that covers all columns in a query for faster lookups.",
    code: "-- For a query like:\n-- SELECT name, salary FROM employees WHERE department = 'Engineering';\n\n-- Covering index includes the filter and selected columns\nCREATE INDEX idx_emp_dept_cov ON employees(department, name, salary);",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "load",
    tags: ["index", "covering index", "optimization"], usage: "Use for frequently-run queries to avoid table lookups entirely.",
    relatedSnippets: ["sql-index-02"],
  },
  {
    id: "sql-index-02",
    title: "Composite index column order",
    description: "Correct column ordering for composite indexes.",
    code: "-- For: WHERE department = 'Engineering' AND salary > 80000\n-- Correct: high selectivity column first\nCREATE INDEX idx_dept_salary ON employees(department, salary);\n\n-- For: WHERE salary > 80000 AND department = 'Engineering'\n-- Still correct: optimizer can reorder predicates",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["index", "composite", "optimization"], usage: "Use when creating multi-column indexes for complex queries.",
    relatedSnippets: ["sql-index-01"],
  },
  {
    id: "sql-part-01",
    title: "Table partitioning pattern",
    description: "Simulate table partitioning using views for date-based data separation.",
    code: "-- Create monthly views to simulate partitioning\nCREATE VIEW orders_2024_01 AS\nSELECT * FROM orders\nWHERE strftime('%Y-%m', order_date) = '2024-01';\n\nCREATE VIEW orders_2024_02 AS\nSELECT * FROM orders\nWHERE strftime('%Y-%m', order_date) = '2024-02';\n\n-- Querying becomes: SELECT * FROM orders_2024_01 WHERE ...",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["partitioning", "view", "optimization"], usage: "Use for logically separating large tables by time until physical partitioning is available.",
    relatedSnippets: [],
  },
  {
    id: "sql-dedup-01",
    title: "Remove duplicates keeping latest",
    description: "Deduplicate rows keeping only the latest version per key.",
    code: "WITH ranked AS (\n  SELECT *,\n    ROW_NUMBER() OVER (PARTITION BY email ORDER BY id DESC) AS rn\n  FROM employees\n)\nDELETE FROM employees WHERE id IN (\n  SELECT id FROM ranked WHERE rn > 1\n);",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "data-quality",
    tags: ["dedup", "ROW_NUMBER", "data quality"], usage: "Use to clean up duplicate records in a table before ETL loads.",
    relatedSnippets: ["sql-dq-03"],
  },
  // Additional snippets to reach 50+
  {
    id: "sql-agg-02",
    title: "HAVING filter after GROUP BY",
    description: "Filter groups based on aggregate conditions.",
    code: "SELECT department, COUNT(*) AS emp_count\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 3;",
    language: "sql", tool: "sql", difficulty: "intermediate", category: "transform",
    tags: ["HAVING", "GROUP BY"], usage: "Use to filter aggregated results, e.g., showing only departments with sufficient headcount.",
    relatedSnippets: [],
  },
  {
    id: "sql-union-01",
    title: "UNION ALL for combining queries",
    description: "Combine results from multiple SELECT statements.",
    code: "SELECT name, department, salary FROM employees\nUNION ALL\nSELECT name, 'External' AS department, 0 AS salary FROM contractors\nORDER BY department, name;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "transform",
    tags: ["UNION ALL", "combine"], usage: "Use to merge datasets with identical columns from different sources.",
    relatedSnippets: [],
  },
  {
    id: "sql-null-01",
    title: "IFNULL for default values",
    description: "Replace NULL with a default value in query results.",
    code: "SELECT name, IFNULL(email, 'no-email@company.com') AS email\nFROM employees;",
    language: "sql", tool: "sql", difficulty: "beginner", category: "data-quality",
    tags: ["IFNULL", "NULL", "default"], usage: "Use in report generation to avoid NULL values in output.",
    relatedSnippets: ["sql-dq-01"],
  },
  {
    id: "py-etl-04",
    title: "Python data type converter",
    description: "Convert and normalize data types during ETL.",
    code: "def normalize_date(val):\n    \"\"\"Convert various date formats to ISO date string.\"\"\"\n    if not val:\n        return None\n    val = str(val).strip()\n    # Handle common formats\n    import re\n    patterns = [\n        (r'^\\d{4}-\\d{2}-\\d{2}$', lambda v: v),           # 2024-01-15\n        (r'^\\d{2}/\\d{2}/\\d{4}$', lambda v: v.split('/')), # 01/15/2024\n        (r'^\\d{4}\\d{2}\\d{2}$', lambda v: v),              # 20240115\n    ]\n    return val  # Simplified for example",
    language: "python", tool: "python", difficulty: "intermediate", category: "transform",
    tags: ["data type", "Python", "ETL"], usage: "Use for normalizing inconsistent date/type formats across sources.",
    relatedSnippets: ["py-etl-01"],
  },
  {
    id: "bash-01",
    title: "Shell script ETL wrapper",
    description: "Bash wrapper for running ETL steps with logging.",
    code: "#!/bin/bash\nset -euo pipefail\n\nLOG_FILE=\"/var/log/etl/$(date +%Y%m%d_%H%M%S).log\"\n\nlog() {\n    echo \"[$(date '+%Y-%m-%d %H:%M:%S')] $1\" | tee -a \"$LOG_FILE\"\n}\n\nlog \"Starting ETL pipeline\"\n\nlog \"Step 1: Extract\"\npython extract.py 2>&1 | tee -a \"$LOG_FILE\"\n\nlog \"Step 2: Transform\"\npython transform.py 2>&1 | tee -a \"$LOG_FILE\"\n\nlog \"Step 3: Load\"\npython load.py 2>&1 | tee -a \"$LOG_FILE\"\n\nlog \"ETL pipeline completed\"",
    language: "bash", tool: "generic-etl", difficulty: "beginner", category: "orchestration",
    tags: ["bash", "shell", "ETL wrapper"], usage: "Use as a simple orchestrator when Airflow or other tools are overkill.",
    relatedSnippets: [],
  },
  {
    id: "py-viz-01",
    title: "Python data profiling report",
    description: "Generate a quick data profiling report using pandas.",
    code: "import pandas as pd\n\ndef profile_data(df: pd.DataFrame, name: str):\n    \"\"\"Generate a profiling summary for any dataframe.\"\"\"\n    report = {\n        'dataset': name,\n        'rows': len(df),\n        'columns': len(df.columns),\n        'missing_cells': df.isnull().sum().sum(),\n        'duplicate_rows': df.duplicated().sum(),\n        'column_profiles': {}\n    }\n\n    for col in df.columns:\n        col_info = {\n            'type': str(df[col].dtype),\n            'nulls': int(df[col].isnull().sum()),\n            'null_pct': round(df[col].isnull().mean() * 100, 1),\n            'unique': int(df[col].nunique()),\n        }\n        if df[col].dtype in ['int64', 'float64']:\n            col_info.update({\n                'min': float(df[col].min()),\n                'max': float(df[col].max()),\n                'mean': float(df[col].mean()),\n                'std': float(df[col].std()),\n            })\n        report['column_profiles'][col] = col_info\n\n    return report",
    language: "python", tool: "python", difficulty: "intermediate", category: "data-quality",
    tags: ["profiling", "pandas", "data quality"], usage: "Use as an ETL pre-check to understand incoming data characteristics.",
    relatedSnippets: ["py-etl-01"],
  },
]
