import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseManager {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'sqlite';
    this.connection = null;
    this.db = null;
    this.isConnected = false;
    
    console.log(`🗄️  Database type: ${this.dbType}`);
  }

  async connect() {
    try {
      if (this.dbType === 'mysql') {
        await this.connectMySQL();
      } else {
        await this.connectSQLite();
      }
      
      console.log(`✅ Database connected successfully (${this.dbType})`);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed:`, error.message);
      
      // Fallback to SQLite if MySQL fails
      if (this.dbType === 'mysql') {
        console.log('🔄 Falling back to SQLite...');
        this.dbType = 'sqlite';
        return await this.connectSQLite();
      }
      
      throw error;
    }
  }

  async connectMySQL() {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'SQl@2025',
      database: process.env.DB_NAME || 'study_app',
      charset: 'utf8mb4',
      timezone: '+00:00',
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };

    console.log(`🔌 Connecting to MySQL at ${config.host}:${config.port}/${config.database}`);
    
    this.connection = await mysql.createConnection(config);
    
    // Test the connection
    await this.connection.execute('SELECT 1');
    
    console.log('✅ MySQL connection established');
  }

  async connectSQLite() {
    console.log('🔌 Connecting to SQLite database...');
    
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database('./study_assistant.db', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ SQLite connection established');
          resolve(true);
        }
      });
    });
  }

  async run(sql, params = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      if (this.dbType === 'mysql') {
        const [result] = await this.connection.execute(sql, params);
        return {
          lastID: result.insertId,
          changes: result.affectedRows
        };
      } else {
        // SQLite
        const dbRun = promisify(this.db.run.bind(this.db));
        return await dbRun(sql, params);
      }
    } catch (error) {
      console.error('Database run error:', error);
      throw error;
    }
  }

  async get(sql, params = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      if (this.dbType === 'mysql') {
        const [rows] = await this.connection.execute(sql, params);
        return rows[0] || null;
      } else {
        // SQLite
        const dbGet = promisify(this.db.get.bind(this.db));
        return await dbGet(sql, params);
      }
    } catch (error) {
      console.error('Database get error:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      if (this.dbType === 'mysql') {
        const [rows] = await this.connection.execute(sql, params);
        return rows;
      } else {
        // SQLite
        const dbAll = promisify(this.db.all.bind(this.db));
        return await dbAll(sql, params);
      }
    } catch (error) {
      console.error('Database all error:', error);
      throw error;
    }
  }

  // Convert SQLite SQL to MySQL compatible SQL
  convertSQL(sql) {
    if (this.dbType === 'mysql') {
      // Convert SQLite specific syntax to MySQL
      sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INT AUTO_INCREMENT PRIMARY KEY');
      sql = sql.replace(/DATETIME DEFAULT CURRENT_TIMESTAMP/g, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      sql = sql.replace(/BOOLEAN/g, 'TINYINT(1)');
      sql = sql.replace(/TEXT/g, 'TEXT');
      
      // Handle JSON columns for MySQL
      if (sql.includes('ai_study_plan TEXT')) {
        sql = sql.replace('ai_study_plan TEXT', 'ai_study_plan JSON');
      }
    }
    return sql;
  }

  async createTables() {
    console.log('📋 Creating database tables...');

    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'student',
        branch VARCHAR(100),
        domain VARCHAR(100),
        current_gpa DECIMAL(3,2),
        expected_gpa DECIMAL(3,2),
        current_study_hours INT,
        expected_study_hours INT,
        current_self_rating INT,
        expected_self_rating INT,
        target_date DATE,
        improvement_areas TEXT,
        motivation TEXT,
        goal_start_date DATE,
        goal_end_date DATE,
        ai_study_plan ${this.dbType === 'mysql' ? 'JSON' : 'TEXT'},
        setup_complete ${this.dbType === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN'} DEFAULT FALSE,
        email_verified ${this.dbType === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN'} DEFAULT TRUE,
        verification_token TEXT,
        reset_token TEXT,
        reset_token_expires ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'},
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        updated_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP ${this.dbType === 'mysql' ? 'ON UPDATE CURRENT_TIMESTAMP' : ''}
      )`,

      // Study sessions table
      `CREATE TABLE IF NOT EXISTS study_sessions (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        duration INT NOT NULL,
        session_type VARCHAR(20) DEFAULT 'focus',
        notes TEXT,
        goal_progress DECIMAL(5,2) DEFAULT 0,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Goal tracking table
      `CREATE TABLE IF NOT EXISTS goal_tracking (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        date DATE NOT NULL,
        gpa_progress DECIMAL(5,2) DEFAULT 0,
        study_hours_completed DECIMAL(5,2) DEFAULT 0,
        self_rating_current DECIMAL(3,1) DEFAULT 0,
        tasks_completed INT DEFAULT 0,
        total_tasks INT DEFAULT 0,
        notes TEXT,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Notifications table
      `CREATE TABLE IF NOT EXISTS notifications (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        type VARCHAR(20) DEFAULT 'reminder',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read ${this.dbType === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN'} DEFAULT FALSE,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Flashcards table
      `CREATE TABLE IF NOT EXISTS flashcards (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        front TEXT NOT NULL,
        back TEXT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        difficulty VARCHAR(10) DEFAULT 'medium',
        last_reviewed ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        next_review ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        review_count INT DEFAULT 0,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        updated_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP ${this.dbType === 'mysql' ? 'ON UPDATE CURRENT_TIMESTAMP' : ''},
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Notes table
      `CREATE TABLE IF NOT EXISTS notes (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        tags TEXT,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        updated_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP ${this.dbType === 'mysql' ? 'ON UPDATE CURRENT_TIMESTAMP' : ''},
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Study groups table
      `CREATE TABLE IF NOT EXISTS study_groups (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        name VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(255) NOT NULL,
        admin_id INT NOT NULL,
        max_members INT DEFAULT 10,
        is_private ${this.dbType === 'mysql' ? 'TINYINT(1)' : 'BOOLEAN'} DEFAULT FALSE,
        tags TEXT,
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Study group members table
      `CREATE TABLE IF NOT EXISTS study_group_members (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        joined_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(group_id, user_id)
      )`,

      // Doubts table
      `CREATE TABLE IF NOT EXISTS doubts (
        id ${this.dbType === 'mysql' ? 'INT AUTO_INCREMENT PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INT NOT NULL,
        question TEXT NOT NULL,
        context TEXT,
        subject VARCHAR(255),
        solution TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP,
        updated_at ${this.dbType === 'mysql' ? 'TIMESTAMP' : 'DATETIME'} DEFAULT CURRENT_TIMESTAMP ${this.dbType === 'mysql' ? 'ON UPDATE CURRENT_TIMESTAMP' : ''},
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      try {
        await this.run(table);
        console.log(`✅ Table created/verified`);
      } catch (error) {
        console.error(`❌ Error creating table:`, error.message);
        throw error;
      }
    }

    console.log('📋 All tables created successfully');
  }

  async close() {
    try {
      if (this.connection && this.dbType === 'mysql') {
        await this.connection.end();
        console.log('🔌 MySQL connection closed');
      } else if (this.db && this.dbType === 'sqlite') {
        this.db.close();
        console.log('🔌 SQLite connection closed');
      }
      this.isConnected = false;
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  // Health check method
  async healthCheck() {
    try {
      if (this.dbType === 'mysql') {
        await this.connection.execute('SELECT 1');
      } else {
        await this.get('SELECT 1');
      }
      return { status: 'healthy', type: this.dbType };
    } catch (error) {
      return { status: 'unhealthy', type: this.dbType, error: error.message };
    }
  }
}

// Create and export singleton instance
const dbManager = new DatabaseManager();

// Export methods for backward compatibility
export const dbRun = (sql, params) => dbManager.run(sql, params);
export const dbGet = (sql, params) => dbManager.get(sql, params);
export const dbAll = (sql, params) => dbManager.all(sql, params);

export default dbManager;