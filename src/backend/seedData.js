const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

<<<<<<< HEAD
mongoose.connect('mongodb+srv://youssef2:youssef2@cluster0.uhrkd.mongodb.net/test1', {});
=======
// Connect to MongoDB
mongoose.connect('', {});
>>>>>>> origin/main

async function generateFakeData() {
  const users = [];
  let counter = 0;
  for (let i = 0; i < 100; i++) {
    const plainPassword = faker.internet.password(); // Generate a plaintext password
    const hashedPassword = await bcrypt.hash(plainPassword, 10); // Hash the password
    
    
    users.push({
      fullname: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword, // Store hashed password
      birthdate: faker.date.birthdate({ min: 1950, max: 2008, mode: 'year' }),
      level: faker.helpers.arrayElement(['Good', 'Medium', 'Mediocre']),
      isverified: faker.datatype.boolean(),
      photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLMI5YxZE03Vnj-s-sth2_JxlPd30Zy7yEGg&s",
    });

    counter +=1;
    
    
    console.log(`Generated account: Email: ${users[i].email}, Password: ${plainPassword},counter: ${counter}` );
 
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
