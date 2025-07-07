#!/usr/bin/env node

import dbManager from './database.js';
import dbUtils from './db-utils.js';
import fs from 'fs';
import path from 'path';

async function checkDatabase() {
  console.log('\n🔍 STUDY ASSISTANT DATABASE CHECKER');
  console.log('=====================================\n');

  try {
    // 1. Check if database file exists
    const dbPath = path.resolve('./study_assistant.db');
    const exists = fs.existsSync(dbPath);
    
    console.log('📁 DATABASE FILE STATUS:');
    console.log(`   Path: ${dbPath}`);
    console.log(`   Exists: ${exists ? '✅ Yes' : '❌ No'}`);
    
    if (exists) {
      const stats = fs.statSync(dbPath);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${stats.birthtime.toLocaleString()}`);
      console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
    }
    console.log('');

    // 2. Test database connection
    console.log('🔌 DATABASE CONNECTION:');
    const health = await dbManager.healthCheck();
    console.log(`   Status: ${health.status === 'healthy' ? '✅ Connected' : '❌ Failed'}`);
    console.log(`   Type: ${health.type}`);
    if (health.error) {
      console.log(`   Error: ${health.error}`);
    }
    console.log('');

    // 3. Initialize database if needed
    if (!exists || health.status !== 'healthy') {
      console.log('🔧 INITIALIZING DATABASE:');
      await dbUtils.initializeDatabase();
      console.log('   ✅ Database initialized successfully\n');
    }

    // 4. Show table information
    console.log('📊 TABLE STATUS:');
    const tables = [
      'users', 'study_sessions', 'goal_tracking', 'notifications',
      'flashcards', 'notes', 'study_groups', 'study_group_members', 'doubts'
    ];
    
    let totalRecords = 0;
    for (const table of tables) {
      try {
        const result = await dbManager.get(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.count;
        totalRecords += count;
        console.log(`   📋 ${table.padEnd(20)} ${count.toString().padStart(3)} records`);
      } catch (error) {
        console.log(`   ❌ ${table.padEnd(20)} Error: ${error.message}`);
      }
    }
    console.log(`   📊 Total Records: ${totalRecords}\n`);

    // 5. Create sample data if database is empty
    if (totalRecords === 0) {
      console.log('🌱 CREATING SAMPLE DATA:');
      await dbUtils.createSampleData();
      console.log('');
    }

    // 6. Show sample user info
    try {
      const sampleUser = await dbManager.get('SELECT name, email FROM users LIMIT 1');
      if (sampleUser) {
        console.log('👤 SAMPLE USER FOR TESTING:');
        console.log(`   📧 Email: ${sampleUser.email}`);
        console.log(`   🔑 Password: password123`);
        console.log(`   👤 Name: ${sampleUser.name}`);
        console.log('');
      }
    } catch (error) {
      console.log('⚠️  Could not fetch sample user info');
    }

    // 7. Final status
    console.log('✅ DATABASE CHECK COMPLETE!');
    console.log('🚀 Your database is ready for the Study Assistant app!');
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Open frontend: http://localhost:5173');
    console.log('   3. Login with sample user or register new account');
    console.log('=====================================\n');

  } catch (error) {
    console.error('\n❌ DATABASE CHECK FAILED:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Make sure you are in the server directory');
    console.log('   2. Run: npm install');
    console.log('   3. Check file permissions');
    console.log('   4. Try deleting study_assistant.db and run this script again');
    console.log('=====================================\n');
    
    process.exit(1);
  } finally {
    // Close database connection
    await dbManager.close();
  }
}

// Run the check
checkDatabase();