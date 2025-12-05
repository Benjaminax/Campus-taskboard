const bcrypt = require('bcryptjs');
const { query } = require('./config/database');

// Test credentials to be seeded
const testUsers = [
  {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    description: 'General student user with team access'
  },
  {
    name: 'Team Lead',
    email: 'teamlead@example.com',
    password: 'password123',
    description: 'Student with team creation and management capabilities'
  },
  {
    name: 'Student',
    email: 'student@example.com',
    password: 'password123',
    description: 'Regular student for testing task assignment'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash passwords
    const saltRounds = 10;

    for (const user of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await query(
          'SELECT id FROM users WHERE email = $1',
          [user.email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
          console.log(`⏭️  User ${user.email} already exists, skipping...`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Insert user
        const newUser = await query(
          'INSERT INTO users (name, email, password, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, name, email',
          [user.name, user.email.toLowerCase(), hashedPassword]
        );

        console.log(`✅ Created user: ${user.email} (ID: ${newUser.rows[0].id})`);
      } catch (userError) {
        console.error(`❌ Error creating user ${user.email}:`, userError.message);
      }
    }

    console.log('✅ Database seeding completed!');
    console.log('\n📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach((user, index) => {
      console.log(`\nTest User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Description: ${user.description}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding error:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
