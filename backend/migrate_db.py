import sqlite3
import os

db_path = "resumeiq.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Check columns in job_descriptions
    cur.execute("PRAGMA table_info(job_descriptions)")
    jd_cols = [row[1] for row in cur.fetchall()]
    print("job_descriptions cols:", jd_cols)
    
    if "skills" not in jd_cols:
        cur.execute("ALTER TABLE job_descriptions ADD COLUMN skills JSON")
        print("Added skills to job_descriptions")
    if "experience_level" not in jd_cols:
        cur.execute("ALTER TABLE job_descriptions ADD COLUMN experience_level VARCHAR(50)")
        print("Added experience_level to job_descriptions")
    if "status" not in jd_cols:
        cur.execute("ALTER TABLE job_descriptions ADD COLUMN status VARCHAR(20) DEFAULT 'Active'")
        print("Added status to job_descriptions")

    # Check columns in analyses
    cur.execute("PRAGMA table_info(analyses)")
    a_cols = [row[1] for row in cur.fetchall()]
    print("analyses cols:", a_cols)
    if "screening_summary" not in a_cols:
        cur.execute("ALTER TABLE analyses ADD COLUMN screening_summary JSON")
        print("Added screening_summary to analyses")

    # Check columns in users
    cur.execute("PRAGMA table_info(users)")
    u_cols = [row[1] for row in cur.fetchall()]
    print("users cols:", u_cols)
    if "is_recruiter" not in u_cols:
        cur.execute("ALTER TABLE users ADD COLUMN is_recruiter BOOLEAN DEFAULT 0")
        print("Added is_recruiter to users")

    # Check columns in subscriptions
    cur.execute("PRAGMA table_info(subscriptions)")
    sub_cols = [row[1] for row in cur.fetchall()]
    print("subscriptions cols:", sub_cols)
    if "provider" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN provider VARCHAR(50) DEFAULT 'stripe'")
        print("Added provider to subscriptions")
    if "provider_subscription_id" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN provider_subscription_id VARCHAR(100)")
        print("Added provider_subscription_id to subscriptions")
    if "provider_customer_id" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN provider_customer_id VARCHAR(100)")
        print("Added provider_customer_id to subscriptions")
    if "current_period_start" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN current_period_start DATETIME")
        print("Added current_period_start to subscriptions")
    if "cancel_at_period_end" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT 0")
        print("Added cancel_at_period_end to subscriptions")
    if "canceled_at" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN canceled_at DATETIME")
        print("Added canceled_at to subscriptions")
    if "trial_end" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN trial_end DATETIME")
        print("Added trial_end to subscriptions")
    if "updated_at" not in sub_cols:
        cur.execute("ALTER TABLE subscriptions ADD COLUMN updated_at DATETIME")
        print("Added updated_at to subscriptions")

    # Create plans table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price_inr INTEGER DEFAULT 0,
        billing_interval VARCHAR(20) DEFAULT 'month',
        features JSON,
        max_analyses INTEGER DEFAULT 3,
        allows_tailor BOOLEAN DEFAULT 0,
        allows_cover_letter BOOLEAN DEFAULT 0,
        allows_recruiter BOOLEAN DEFAULT 0,
        created_at DATETIME
    )
    """)
    print("Ensured plans table")

    # Create invoices table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        subscription_id VARCHAR(36),
        invoice_number VARCHAR(100) UNIQUE NOT NULL,
        provider VARCHAR(50) DEFAULT 'stripe',
        provider_invoice_id VARCHAR(100),
        amount FLOAT DEFAULT 0.0,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'paid',
        plan_name VARCHAR(50) DEFAULT 'pro',
        invoice_pdf_url VARCHAR(500),
        paid_at DATETIME,
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    )
    """)
    print("Ensured invoices table")

    # Create payments table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        subscription_id VARCHAR(36),
        invoice_id VARCHAR(36),
        provider VARCHAR(50) DEFAULT 'stripe',
        provider_payment_id VARCHAR(100),
        amount FLOAT DEFAULT 0.0,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(50) DEFAULT 'succeeded',
        payment_method VARCHAR(50) DEFAULT 'card',
        failure_reason VARCHAR(255),
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id),
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
    """)
    print("Ensured payments table")

    # Create usage_trackers table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS usage_trackers (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        month VARCHAR(20),
        analyses_used INTEGER DEFAULT 0,
        resumes_uploaded INTEGER DEFAULT 0,
        ai_generations_used INTEGER DEFAULT 0,
        last_reset_at DATETIME,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """)
    print("Ensured usage_trackers table")

    conn.commit()
    conn.close()
    print("Migration finished successfully.")
