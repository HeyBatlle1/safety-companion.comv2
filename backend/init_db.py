#!/usr/bin/env python3
"""
Database Initialization Script for Agent Configuration

Creates only the agent configuration tables.
Run this script to initialize the database with agent configuration tables.
"""

import asyncio
from sqlalchemy import create_engine, MetaData
from app.core.config import get_settings

async def init_agent_config_db():
    """Initialize only agent configuration tables"""
    print("🔧 Initializing agent configuration database tables...")

    settings = get_settings()

    # For SQLite, use synchronous engine for simple table creation
    if settings.database_url.startswith("sqlite://"):
        database_url = settings.database_url
    else:
        database_url = settings.database_url

    # Use synchronous engine for table creation
    engine = create_engine(database_url, echo=True)

    # Create tables manually with SQL
    with engine.connect() as conn:
        # Create agent_configurations table
        from sqlalchemy import text
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agent_configurations (
                id INTEGER PRIMARY KEY,
                user_id TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                model TEXT NOT NULL,
                temperature REAL DEFAULT 0.7,
                max_tokens INTEGER DEFAULT 4000,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP,
                total_executions INTEGER DEFAULT 0,
                avg_execution_time_ms REAL,
                notes TEXT,
                UNIQUE(user_id, agent_name)
            )
        """))

        # Create agent_performance_logs table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS agent_performance_logs (
                id INTEGER PRIMARY KEY,
                config_id INTEGER NOT NULL,
                execution_id TEXT NOT NULL,
                execution_time_ms REAL NOT NULL,
                token_usage_input INTEGER,
                token_usage_output INTEGER,
                token_usage_total INTEGER,
                success BOOLEAN NOT NULL,
                error_message TEXT,
                output_quality_score REAL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (config_id) REFERENCES agent_configurations (id)
            )
        """))

        conn.commit()

        print("✅ Agent configuration tables created successfully!")
        print("📊 Created tables: agent_configurations, agent_performance_logs")

if __name__ == "__main__":
    asyncio.run(init_agent_config_db())