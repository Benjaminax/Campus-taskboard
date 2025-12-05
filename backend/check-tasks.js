const { query } = require('./config/database');

(async () => {
  try {
    // First check if tasks table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'tasks'
      )
    `);
    console.log('\n✓ Tasks table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Get tasks count
      const count = await query('SELECT COUNT(*) as count FROM tasks');
      console.log('✓ Total tasks in DB:', count.rows[0].count);
      
      // Get sample tasks
      const tasks = await query('SELECT id, title, status, created_at, team_id FROM tasks LIMIT 5');
      console.log('✓ Sample tasks:');
      console.log(JSON.stringify(tasks.rows, null, 2));
    } else {
      console.log('✗ Tasks table does NOT exist in database');
    }
    process.exit(0);
  } catch(e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
})();
