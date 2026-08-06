let SQL: any = null
let db: any = null
let initPromise: Promise<any> | null = null

const DATASET_DDL = `
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL,
  email TEXT,
  manager_id INTEGER
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed'
);

CREATE TABLE IF NOT EXISTS orders (
  order_id INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  total REAL NOT NULL,
  order_date TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address TEXT
);

CREATE TABLE IF NOT EXISTS products (
  product_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  city TEXT,
  signup_date TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  log_id INTEGER PRIMARY KEY,
  timestamp TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  service_name TEXT NOT NULL,
  duration_ms INTEGER,
  status_code INTEGER
);
`

const EMPLOYEES_DATA = [
  [1, 'Alice Johnson', 'Engineering', 95000, '2020-03-15', 'alice@example.com', null],
  [2, 'Bob Smith', 'Marketing', 72000, '2019-07-22', 'bob@example.com', 1],
  [3, 'Charlie Brown', 'Engineering', 88000, '2021-01-10', 'charlie@example.com', 1],
  [4, 'Diana Prince', 'Sales', 65000, '2022-04-05', 'diana@example.com', 2],
  [5, 'Edward Norton', 'Engineering', 102000, '2018-11-01', 'edward@example.com', null],
  [6, 'Fiona Apple', 'Marketing', 58000, '2023-02-14', 'fiona@example.com', 2],
  [7, 'George Lucas', 'Sales', 75000, '2020-08-19', 'george@example.com', 4],
  [8, 'Hannah Lee', 'Engineering', 91000, '2021-06-01', 'hannah@example.com', 5],
  [9, 'Ivan Petrov', 'HR', 62000, '2019-04-30', 'ivan@example.com', null],
  [10, 'Julia Roberts', 'Sales', 83000, '2020-12-11', 'julia@example.com', 4],
  [11, 'Kevin Hart', 'Engineering', 97000, '2022-09-15', 'kevin@example.com', 5],
  [12, 'Laura Palmer', 'HR', 55000, '2023-06-20', 'laura@example.com', 9],
  [13, 'Mike Tyson', 'Marketing', 69000, '2021-03-08', 'mike@example.com', 6],
  [14, 'Nina Simone', 'Engineering', 105000, '2019-08-25', 'nina@example.com', null],
  [15, 'Oscar Wilde', 'Sales', 71000, '2022-01-17', 'oscar@example.com', 10],
  [16, 'Patty Hearst', 'Engineering', 86000, '2020-05-30', 'patty@example.com', 14],
  [17, 'Quinn Fabray', 'Marketing', 53000, '2023-09-01', 'quinn@example.com', 13],
  [18, 'Rachel Green', 'HR', 67000, '2021-11-12', 'rachel@example.com', 9],
  [19, 'Steve Rogers', 'Engineering', 94000, '2018-06-15', 'steve@example.com', 14],
  [20, 'Tina Turner', 'Sales', 78000, '2020-10-05', 'tina@example.com', 15],
  [21, 'Uma Thurman', 'Marketing', 61000, '2022-07-22', 'uma@example.com', 6],
  [22, 'Victor Hugo', 'Engineering', 99000, '2019-02-18', 'victor@example.com', 5],
  [23, 'Wendy Davis', 'HR', 59000, '2023-04-10', 'wendy@example.com', 18],
  [24, 'Xander Cage', 'Sales', 82000, '2021-08-29', 'xander@example.com', 10],
  [25, 'Yara Shahidi', 'Engineering', 87000, '2022-12-05', 'yara@example.com', 14],
]

const TRANSACTIONS_DATA = [
  [1, 1, 150.00, '2024-01-15', 'Groceries', 'Weekly shopping', 'completed'],
  [2, 2, 49.99, '2024-01-16', 'Entertainment', 'Netflix subscription', 'completed'],
  [3, 1, 1200.00, '2024-01-17', 'Rent', 'January rent', 'completed'],
  [4, 3, 89.50, '2024-01-18', 'Dining', 'Restaurant dinner', 'completed'],
  [5, 2, 200.00, '2024-01-19', 'Transport', 'Gas refill', 'completed'],
  [6, 4, 350.00, '2024-01-20', 'Shopping', 'Clothing purchase', 'pending'],
  [7, 1, 25.00, '2024-01-21', 'Entertainment', 'Movie tickets', 'completed'],
  [8, 3, 600.00, '2024-01-22', 'Utilities', 'Electric bill', 'completed'],
  [9, 5, 75.00, '2024-01-23', 'Dining', 'Lunch meeting', 'completed'],
  [10, 2, 500.00, '2024-01-24', 'Travel', 'Flight booking', 'pending'],
  [11, 1, 45.00, '2024-02-01', 'Groceries', 'Weekly shopping', 'completed'],
  [12, 4, 120.00, '2024-02-02', 'Entertainment', 'Concert tickets', 'completed'],
  [13, 3, 800.00, '2024-02-03', 'Rent', 'February rent', 'completed'],
  [14, 5, 33.99, '2024-02-04', 'Entertainment', 'Spotify subscription', 'completed'],
  [15, 1, 210.00, '2024-02-05', 'Transport', 'Car maintenance', 'completed'],
  [16, 2, 950.00, '2024-02-06', 'Shopping', 'Electronics', 'completed'],
  [17, 4, 55.00, '2024-02-07', 'Dining', 'Date night dinner', 'completed'],
  [18, 3, 180.00, '2024-02-08', 'Utilities', 'Internet bill', 'completed'],
  [19, 5, 400.00, '2024-02-09', 'Travel', 'Hotel booking', 'pending'],
  [20, 1, 320.00, '2024-02-10', 'Shopping', 'Furniture', 'completed'],
  [21, 2, 67.50, '2024-02-15', 'Groceries', 'Weekly shopping', 'completed'],
  [22, 3, 150.00, '2024-02-16', 'Dining', 'Birthday dinner', 'completed'],
  [23, 4, 75.00, '2024-02-17', 'Entertainment', 'Video game', 'completed'],
  [24, 5, 1100.00, '2024-02-18', 'Rent', 'March rent', 'completed'],
  [25, 1, 40.00, '2024-02-19', 'Transport', 'Bus pass', 'completed'],
  [26, 2, 280.00, '2024-02-20', 'Utilities', 'Water bill', 'completed'],
  [27, 3, 95.00, '2024-02-21', 'Shopping', 'Books', 'completed'],
  [28, 4, 520.00, '2024-02-22', 'Travel', 'Train tickets', 'pending'],
  [29, 5, 185.00, '2024-02-23', 'Dining', 'Team lunch', 'completed'],
  [30, 1, 60.00, '2024-02-24', 'Entertainment', 'Streaming service', 'completed'],
]

const ORDERS_DATA = [
  [1, 101, 1001, 2, 59.98, '2024-01-10', 'delivered', '123 Main St, NY'],
  [2, 102, 1002, 1, 49.99, '2024-01-11', 'delivered', '456 Oak Ave, LA'],
  [3, 103, 1003, 3, 149.97, '2024-01-12', 'shipped', '789 Pine Rd, SF'],
  [4, 101, 1004, 1, 299.99, '2024-01-14', 'delivered', '123 Main St, NY'],
  [5, 104, 1001, 5, 149.95, '2024-01-15', 'pending', '321 Elm St, CHI'],
  [6, 102, 1005, 2, 79.98, '2024-01-18', 'delivered', '456 Oak Ave, LA'],
  [7, 105, 1002, 1, 49.99, '2024-01-20', 'cancelled', '654 Maple Dr, SEA'],
  [8, 103, 1006, 1, 199.99, '2024-01-22', 'delivered', '789 Pine Rd, SF'],
  [9, 104, 1003, 2, 99.98, '2024-01-25', 'shipped', '321 Elm St, CHI'],
  [10, 101, 1007, 1, 89.99, '2024-01-28', 'delivered', '123 Main St, NY'],
  [11, 105, 1004, 1, 299.99, '2024-02-01', 'pending', '654 Maple Dr, SEA'],
  [12, 102, 1006, 1, 199.99, '2024-02-03', 'shipped', '456 Oak Ave, LA'],
  [13, 103, 1001, 4, 119.96, '2024-02-05', 'delivered', '789 Pine Rd, SF'],
  [14, 106, 1005, 3, 119.97, '2024-02-07', 'pending', '987 Birch Ln, MIA'],
  [15, 104, 1007, 2, 179.98, '2024-02-10', 'shipped', '321 Elm St, CHI'],
  [16, 101, 1002, 2, 99.98, '2024-02-12', 'delivered', '123 Main St, NY'],
  [17, 106, 1003, 1, 49.99, '2024-02-15', 'delivered', '987 Birch Ln, MIA'],
  [18, 102, 1007, 1, 89.99, '2024-02-18', 'shipped', '456 Oak Ave, LA'],
  [19, 103, 1004, 1, 299.99, '2024-02-20', 'pending', '789 Pine Rd, SF'],
  [20, 105, 1005, 2, 79.98, '2024-02-22', 'delivered', '654 Maple Dr, SEA'],
]

const PRODUCTS_DATA = [
  [1001, 'Widget Pro', 'Electronics', 29.99, 150],
  [1002, 'Gadget X', 'Electronics', 49.99, 75],
  [1003, 'Accessory Pack', 'Accessories', 49.99, 200],
  [1004, 'Premium Kit', 'Electronics', 299.99, 30],
  [1005, 'Basic Tool Set', 'Tools', 39.99, 120],
  [1006, 'Smart Home Hub', 'Electronics', 199.99, 45],
  [1007, 'Eco Water Bottle', 'Accessories', 89.99, 300],
]

const CUSTOMERS_DATA = [
  [101, 'John Smith', 'john@email.com', 'New York', '2023-06-15'],
  [102, 'Emma Wilson', 'emma@email.com', 'Los Angeles', '2023-07-22'],
  [103, 'Michael Chen', 'michael@email.com', 'San Francisco', '2023-08-10'],
  [104, 'Sarah Davis', 'sarah@email.com', 'Chicago', '2023-09-05'],
  [105, 'James Brown', 'james@email.com', 'Seattle', '2023-10-18'],
  [106, 'Lisa Anderson', 'lisa@email.com', 'Miami', '2023-11-30'],
]

const LOGS_DATA = [
  [1, '2024-01-15 08:30:00', 'INFO', 'Pipeline started successfully', 'etl-pipeline', 1200, 200],
  [2, '2024-01-15 08:30:05', 'DEBUG', 'Connecting to source database', 'etl-pipeline', null, null],
  [3, '2024-01-15 08:30:10', 'INFO', 'Source connection established', 'etl-pipeline', 5000, 200],
  [4, '2024-01-15 08:30:15', 'WARN', 'Slow query detected: SELECT * FROM orders WHERE 1=1', 'query-optimizer', 15000, null],
  [5, '2024-01-15 08:30:20', 'ERROR', 'Connection timeout to target database', 'etl-pipeline', 30000, 504],
  [6, '2024-01-15 08:31:00', 'INFO', 'Retry attempt 1/3', 'etl-pipeline', 500, null],
  [7, '2024-01-15 08:31:05', 'INFO', 'Target connection established on retry', 'etl-pipeline', 2000, 200],
  [8, '2024-01-15 08:31:10', 'INFO', 'Extraction phase completed: 5000 rows', 'etl-pipeline', 5000, 200],
  [9, '2024-01-15 08:31:15', 'INFO', 'Transform phase: applying business rules', 'transform-service', 8000, 200],
  [10, '2024-01-15 08:31:20', 'WARN', 'Null values detected in column: email, table: customers', 'data-quality', null, null],
  [11, '2024-01-15 08:31:25', 'ERROR', 'Data type mismatch: expected INTEGER, got TEXT in column amount', 'transform-service', null, 400],
  [12, '2024-01-15 08:31:30', 'INFO', 'Skipping row 245 due to validation error', 'transform-service', 100, 200],
  [13, '2024-01-15 08:32:00', 'CRITICAL', 'Disk space critically low: 500MB remaining', 'monitoring', null, null],
  [14, '2024-01-15 08:32:05', 'INFO', 'Load phase: writing to data warehouse', 'load-service', 15000, 200],
  [15, '2024-01-15 08:32:20', 'INFO', 'Pipeline completed: 4985 rows loaded successfully', 'etl-pipeline', 120000, 200],
  [16, '2024-01-15 09:00:00', 'INFO', 'Scheduled job: daily_aggregation started', 'scheduler', 500, 200],
  [17, '2024-01-15 09:00:05', 'ERROR', 'Duplicate key violation on table: daily_sales_summary', 'load-service', null, 409],
  [18, '2024-01-15 09:00:10', 'INFO', 'Running deduplication before insert', 'transform-service', 3000, 200],
  [19, '2024-01-15 09:00:15', 'INFO', 'Aggregation complete: 1250 records processed', 'transform-service', 5000, 200],
  [20, '2024-01-15 09:01:00', 'INFO', 'Job daily_aggregation completed successfully', 'scheduler', 60000, 200],
  [21, '2024-01-15 10:00:00', 'ERROR', 'API rate limit exceeded for service: payment-gateway', 'api-gateway', null, 429],
  [22, '2024-01-15 10:00:30', 'INFO', 'Rate limit reset, resuming operations', 'api-gateway', 500, 200],
  [23, '2024-01-15 11:00:00', 'WARN', 'High memory usage: 85% of 16GB allocated', 'monitoring', null, null],
  [24, '2024-01-15 12:00:00', 'INFO', 'Data quality report generated: 0.02% anomaly rate', 'data-quality', 45000, 200],
  [25, '2024-01-15 13:00:00', 'CRITICAL', 'Pipeline failure: etl_daily_refresh exited with code 1', 'etl-pipeline', null, 500],
]

function insertData(db: any, table: string, columns: string[], data: any[][]) {
  const placeholders = columns.map(() => '?').join(', ')
  const stmt = db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`)
  for (const row of data) {
    stmt.run(row)
  }
  stmt.free()
}

export async function getDatabase(): Promise<any> {
  if (db) return db
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      const initSqlJs = await import('sql.js')
      const initFn = initSqlJs.default || initSqlJs
      SQL = await initFn({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/${file}`
      })
      db = new SQL.Database()

      // Execute DDL
      db.run(DATASET_DDL)

      // Insert data
      insertData(db, 'employees',
        ['id', 'name', 'department', 'salary', 'hire_date', 'email', 'manager_id'],
        EMPLOYEES_DATA)

      insertData(db, 'transactions',
        ['id', 'user_id', 'amount', 'date', 'category', 'description', 'status'],
        TRANSACTIONS_DATA)

      insertData(db, 'orders',
        ['order_id', 'customer_id', 'product_id', 'quantity', 'total', 'order_date', 'status', 'shipping_address'],
        ORDERS_DATA)

      insertData(db, 'products',
        ['product_id', 'name', 'category', 'price', 'stock'],
        PRODUCTS_DATA)

      insertData(db, 'customers',
        ['customer_id', 'name', 'email', 'city', 'signup_date'],
        CUSTOMERS_DATA)

      insertData(db, 'logs',
        ['log_id', 'timestamp', 'level', 'message', 'service_name', 'duration_ms', 'status_code'],
        LOGS_DATA)

      return db
    } catch (error) {
      initPromise = null
      throw error
    }
  })()

  return initPromise
}

export function executeQuery(db: any, sql: string): { columns: string[]; rows: Record<string, unknown>[]; rowCount: number; affectedRows?: number } {
  const trimmedSql = sql.trim().toUpperCase()

  if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('PRAGMA') || trimmedSql.startsWith('EXPLAIN')) {
    const stmt = db.prepare(sql)
    const columns = stmt.getColumnNames()
    const rows: Record<string, unknown>[] = []
    while (stmt.step()) {
      rows.push(stmt.getAsObject())
    }
    stmt.free()
    return { columns, rows, rowCount: rows.length }
  } else {
    db.run(sql)
    const affectedRows = db.getRowsModified()
    return { columns: [], rows: [], rowCount: 0, affectedRows }
  }
}

export function getSchema(db: any): { tableName: string; columns: { name: string; type: string }[] }[] {
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  const schema: { tableName: string; columns: { name: string; type: string }[] }[] = []

  for (const table of tables) {
    const tableName = table.values[0][0] as string
    const cols = db.exec(`PRAGMA table_info('${tableName}')`)
    const columns = cols[0]?.values.map((col: any) => ({
      name: col[1] as string,
      type: col[2] as string,
    })) || []
    schema.push({ tableName, columns })
  }

  return schema
}

export function createTableFromCsv(db: any, rawTableName: string, csvContent: string): { tableName: string; columnCount: number; rowCount: number } {
  const lines = csvContent.trim().split("\n").map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) throw new Error("CSV file is empty")

  const tableName = rawTableName.toLowerCase().replace(/[^a-z0-9_]/g, "_") || "user_upload"
  const rawHeaders = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim())
  const cleanHeaders = rawHeaders.map((h, i) => h.toLowerCase().replace(/[^a-z0-9_]/g, "_") || `col_${i + 1}`)

  // Drop if exists and create table
  db.run(`DROP TABLE IF EXISTS ${tableName};`)
  const ddl = `CREATE TABLE ${tableName} (${cleanHeaders.map((h) => `${h} TEXT`).join(", ")});`
  db.run(ddl)

  // Insert rows
  const placeholders = cleanHeaders.map(() => "?").join(", ")
  const stmt = db.prepare(`INSERT INTO ${tableName} VALUES (${placeholders});`)

  let count = 0
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",").map((v) => v.replace(/^["']|["']$/g, "").trim())
    stmt.run(vals)
    count++
  }
  stmt.free()

  return { tableName, columnCount: cleanHeaders.length, rowCount: count }
}

export function disposeDatabase() {
  if (db) {
    db.close()
    db = null
    SQL = null
  }
  initPromise = null
}
