import dbManager from './database.js';

// Database utility functions for development and debugging

export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Connect to database
    await dbManager.connect();
    
    // Create all tables
    await dbManager.createTables();
    
    console.log('✅ Database initialization complete!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function checkDatabaseHealth() {
  try {
    const health = await dbManager.healthCheck();
    console.log('🏥 Database Health Check:', health);
    return health;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return { status: 'error', error: error.message };
  }
}

export async function showDatabaseInfo() {
  try {
    console.log('\n📊 DATABASE INFORMATION:');
    console.log('========================');
    
    // Check if database file exists
    const fs = await import('fs');
    const path = await import('path');
    
    const dbPath = path.resolve('./study_assistant.db');
    const exists = fs.existsSync(dbPath);
    
    console.log(`📁 Database file: ${dbPath}`);
    console.log(`✅ File exists: ${exists}`);
    
    if (exists) {
      const stats = fs.statSync(dbPath);
      console.log(`📏 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Created: ${stats.birthtime.toISOString()}`);
      console.log(`🔄 Modified: ${stats.mtime.toISOString()}`);
    }
    
    // Test database connection
    const health = await checkDatabaseHealth();
    console.log(`🔌 Connection: ${health.status}`);
    console.log(`🗄️  Type: ${health.type}`);
    
    // Count tables and records
    await showTableInfo();
    
    console.log('========================\n');
    
  } catch (error) {
    console.error('❌ Error showing database info:', error);
  }
}

export async function showTableInfo() {
  try {
    console.log('\n📋 TABLE INFORMATION:');
    console.log('---------------------');
    
    const tables = [
      'users',
      'study_sessions', 
      'goal_tracking',
      'notifications',
      'flashcards',
      'notes',
      'study_groups',
      'study_group_members',
      'doubts'
    ];
    
    for (const table of tables) {
      try {
        const count = await dbManager.get(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${count.count} records`);
      } catch (error) {
        console.log(`❌ ${table}: Error (${error.message})`);
      }
    }
    
    console.log('---------------------\n');
    
  } catch (error) {
    console.error('❌ Error showing table info:', error);
  }
}

export async function createSampleData() {
  try {
    console.log('🌱 Creating sample data...');
    
    // Check if we already have users
    const userCount = await dbManager.get('SELECT COUNT(*) as count FROM users');
    
    if (userCount.count > 0) {
      console.log('📊 Sample data already exists. Skipping...');
      return;
    }
    
    // Create a sample user (password: "password123")
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const result = await dbManager.run(
      `INSERT INTO users (name, email, password, category, setup_complete, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['Demo User', 'demo@example.com', hashedPassword, 'student', true, true]
    );
    
    console.log(`✅ Sample user created with ID: ${result.lastID}`);
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: password123');
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

export async function resetDatabase() {
  try {
    console.log('🗑️  Resetting database...');
    
    const tables = [
      'study_group_members',
      'study_groups',
      'doubts',
      'notes',
      'flashcards',
      'notifications',
      'goal_tracking',
      'study_sessions',
      'users'
    ];
    
    // Drop tables in reverse order to handle foreign keys
    for (const table of tables) {
      try {
        await dbManager.run(`DROP TABLE IF EXISTS ${table}`);
        console.log(`🗑️  Dropped table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not drop ${table}: ${error.message}`);
      }
    }
    
    // Recreate tables
    await dbManager.createTables();
    
    console.log('✅ Database reset complete!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  }
}

// Export all functions
export default {
  initializeDatabase,
  checkDatabaseHealth,
  showDatabaseInfo,
  showTableInfo,
  createSampleData,
  resetDatabase
};