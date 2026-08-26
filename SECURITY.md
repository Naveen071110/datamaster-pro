# Security & Privacy Policy

## 🔒 Security Architecture & Privacy Guarantee

**DataMaster Pro** is engineered from the ground up to be a **100% privacy-first, client-side utility suite**. 

### 1. In-Browser WebAssembly Sandboxing
- **Zero Server Uploads**: When you upload CSV files, write SQL queries, generate dbt models, construct Snowflake stages, or parse Informatica XML mappings, **your data never leaves your browser**.
- **Local SQLite WASM Engine**: All database execution is processed in-memory via sql.js (WebAssembly compiled SQLite).
- **Zero Remote Storage**: DataMaster Pro operates without databases, cloud storage buckets, or remote servers that persist user files.

### 2. Cookie & Session Security (OWASP Compliance)
- **Centralized Taxonomy**: Categorizes cookies strictly into *Strictly Necessary*, *Functional*, *Analytics*, and *Marketing*.
- **Defense-in-Depth Flags**: All cookies are secured with Secure, SameSite=Lax or SameSite=Strict, and Path=/. Authentication helpers enforce HttpOnly and __Host- prefixes.
- **Runtime Consent Gating**: Non-essential cookies are blocked at the client layer unless the user grants explicit consent via the GDPR cookie banner. Disallowed cookies are automatically purged upon consent revocation.
- **Header Injection & Payload Guards**: Cookie keys and values are sanitized against CRLF injection and strictly capped at 4,096 bytes.

### 3. Reporting a Vulnerability

We take the security and privacy of our users seriously. If you discover a potential vulnerability or security flaw, please report it responsibly:

1. **Email**: Open an issue on GitHub or reach out to the project maintainer at [naveenguru.vercel.app](https://naveenguru.vercel.app).
2. **Details**: Provide a clear description, reproduction steps, and potential impact.
3. **Response Time**: We aim to acknowledge reports within 48 hours and deploy remediation patches swiftly.
