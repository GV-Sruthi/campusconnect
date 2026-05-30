import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import Note from './models/Note.js';
import Event from './models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Post.deleteMany({});
    await Note.deleteMany({});
    await Event.deleteMany({});

    const users = await User.create([
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@college.com',
        password: 'password123',
        branch: 'CSE',
        year: 2,
        skills: ['React', 'Node.js', 'MongoDB'],
        interests: ['Web Development', 'AI'],
        role: 'student',
      },
      {
        name: 'Priya Singh',
        email: 'priya@college.com',
        password: 'password123',
        branch: 'ECE',
        year: 3,
        skills: ['IoT', 'Arduino'],
        interests: ['Robotics'],
        role: 'club',
      },
      {
        name: 'Admin User',
        email: 'admin@college.com',
        password: 'password123',
        branch: 'CSE',
        year: 4,
        skills: [],
        role: 'superadmin',
      },
    ]);

    console.log('✓ Users created:', users.length);

    const posts = await Post.create([
      {
        title: 'Campus Tech Hackathon 2024',
        description: 'Join us for an amazing hackathon on Dec 15th! All students welcome.',
        category: 'announcement',
        author: users[0]._id,
        tags: ['hackathon', 'coding'],
      },
      {
        title: 'Lost: Blue Backpack',
        description: 'Lost my blue backpack near the library. Contains important notes. Please contact if found.',
        category: 'lostfound',
        author: users[1]._id,
        tags: ['lost'],
      },
      {
        title: 'Looking for React Developers',
        description: 'Our startup is hiring React developers. Contact for internship opportunities.',
        category: 'recruitment',
        author: users[0]._id,
        tags: ['recruitment', 'react'],
      },
      {
        title: 'URGENT: Classes Rescheduled',
        description: 'All classes on Monday are rescheduled to Tuesday due to infrastructure issues.',
        category: 'urgent',
        author: users[2]._id,
        tags: ['urgent', 'academic'],
        isPinned: true,
      },
      {
        title: 'Discussion: Best Programming Languages',
        description: 'What do you think is the best programming language for beginners?',
        category: 'discussion',
        author: users[1]._id,
        tags: ['programming', 'discussion'],
      },
    ]);

    console.log('✓ Posts created:', posts.length);

    const notes = await Note.create([
      {
        title: 'Data Structures - Unit 1',
        subject: 'Data Structures',
        semester: 2,
        branch: 'CSE',
        unit: 'Unit 1 - Arrays & Linked Lists',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[0]._id,
      },
      {
        title: 'Digital Electronics Notes',
        subject: 'Digital Electronics',
        semester: 3,
        branch: 'ECE',
        unit: 'Unit 2 - Logic Gates',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[1]._id,
      },
      {
        title: 'Database Management System',
        subject: 'DBMS',
        semester: 4,
        branch: 'CSE',
        unit: 'Unit 3 - Normalization',
        pdfLink: 'https://via.placeholder.com/150.pdf',
        uploadedBy: users[0]._id,
      },
    ]);

    console.log('✓ Notes created:', notes.length);

    const events = await Event.create([
      {
        eventName: 'Annual Tech Fest 2024',
        description: 'Biggest technical festival of the year with competitions and workshops.',
        venue: 'Main Campus Hall',
        date: new Date('2024-12-15'),
        time: '10:00 AM',
        registrationLink: 'https://forms.example.com/techfest',
        postedBy: users[1]._id,
        category: 'hackathon',
      },
      {
        eventName: 'Expert Talk: AI in Industry',
        description: 'Hear from leading AI researchers about the future of artificial intelligence.',
        venue: 'Auditorium',
        date: new Date('2024-12-10'),
        time: '2:00 PM',
        registrationLink: 'https://forms.example.com/aitalk',
        postedBy: users[2]._id,
        category: 'seminar',
      },
    ]);

    console.log('✓ Events created:', events.length);
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
