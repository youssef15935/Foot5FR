const { faker } = require('@faker-js/faker'); // Ensure the latest version is installed
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt for hashing passwords
const User = require('./models/User'); // Adjust path to your user model file

// Connect to MongoDB
mongoose.connect('mongodb+srv://youssef2:youssef2@cluster0.uhrkd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {});

// Generate and insert fake data
async function generateFakeData() {
  const users = [];
  for (let i = 0; i < 20; i++) { // Adjust the number for more data
    const hashedPassword = await bcrypt.hash(faker.internet.password(), 10); // Hash the generated password
    users.push({
      fullname: faker.person.fullName(), // Updated for latest faker version
      email: faker.internet.email(),
      password: hashedPassword, // Use the hashed password
      birthdate: faker.date.birthdate({ min: 1950, max: 2010, mode: 'year' }),
      level: faker.helpers.arrayElement(['Good', 'Medium', 'Mediocre']),
      isverified: faker.datatype.boolean(),
      photo: faker.image.avatar(),
    });
  }

  try {
    await User.insertMany(users);
    console.log("Fake data generated and inserted successfully!");
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    mongoose.connection.close();
  }
}

generateFakeData();
