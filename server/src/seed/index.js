const mongoose = require('mongoose');
const config = require('../config');
const { User, Profile, Opportunity, Event, Notification } = require('../models');

async function seedData() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to Database for seeding...');

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
    }
    console.log('Dropped existing collections.');

    // 1. Admin
    const admin = await User.create({
      email: 'admin@alumni.network',
      password: 'Admin@123',
      role: 'admin',
      firstName: 'System',
      lastName: 'Admin'
    });
    await Profile.create({ user: admin._id });

    // 2. Alumni (all verified for testing)
    const alumniData = [
      {
        firstName: 'Rahul', lastName: 'Sharma', dept: 'CSE', company: 'Google',
        batch: '2018', role: 'Senior Software Engineer',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'System Design'],
        domains: ['Web Development', 'Cloud Computing', 'Distributed Systems'],
        bio: 'Building scalable web applications at Google. Passionate about open source and mentoring.'
      },
      {
        firstName: 'Priya', lastName: 'Patel', dept: 'ECE', company: 'Microsoft',
        batch: '2019', role: 'Cloud Solutions Architect',
        skills: ['Azure', 'Python', 'Machine Learning', 'IoT', 'Docker'],
        domains: ['Cloud Computing', 'IoT', 'Machine Learning'],
        bio: 'Designing cloud-native solutions at Microsoft. Love connecting hardware with cloud.'
      },
      {
        firstName: 'Amit', lastName: 'Kumar', dept: 'ME', company: 'Amazon',
        batch: '2020', role: 'Product Manager',
        skills: ['Product Strategy', 'Data Analysis', 'SQL', 'Python', 'Agile'],
        domains: ['Product Management', 'E-Commerce', 'Supply Chain'],
        bio: 'Driving product innovation at Amazon. Bridging engineering and business.'
      },
      {
        firstName: 'Sneha', lastName: 'Reddy', dept: 'CE', company: 'Flipkart',
        batch: '2021', role: 'Data Scientist',
        skills: ['Python', 'TensorFlow', 'SQL', 'Statistics', 'NLP'],
        domains: ['Data Science', 'Machine Learning', 'Analytics'],
        bio: 'Using data to drive decisions at Flipkart. Passionate about AI for social good.'
      },
      {
        firstName: 'Vikram', lastName: 'Singh', dept: 'EEE', company: 'Infosys',
        batch: '2022', role: 'Full Stack Developer',
        skills: ['Java', 'Spring Boot', 'Angular', 'PostgreSQL', 'AWS'],
        domains: ['Enterprise Software', 'Web Development', 'DevOps'],
        bio: 'Building enterprise solutions at Infosys. Keen on DevOps and automation.'
      }
    ];

    const currentYear = new Date().getFullYear();
    const alumniUsers = [];
    for (let i = 0; i < alumniData.length; i++) {
      const a = alumniData[i];
      const user = await User.create({
        email: `alumni${i + 1}@alumni.network`,
        password: 'Password@123',
        role: 'alumni',
        alumniStatus: 'verified',
        firstName: a.firstName,
        lastName: a.lastName,
        department: a.dept,
        batch: a.batch,
        rollNo: `A${a.batch}${100 + i}`
      });
      await Profile.create({
        user: user._id,
        headline: `${a.role} at ${a.company}`,
        bio: a.bio,
        currentCompany: a.company,
        currentRole: a.role,
        location: 'Bangalore',
        skills: a.skills,
        domains: a.domains,
        experience: currentYear - parseInt(a.batch)
      });
      alumniUsers.push(user);
    }

    // 3. Students
    const studentData = [
      {
        firstName: 'Ananya', lastName: 'Gupta', dept: 'CSE', batch: '2025',
        skills: ['Python', 'JavaScript', 'React'],
        goals: ['Full Stack Developer', 'Open Source Contributor'],
        interests: ['Web Development', 'AI']
      },
      {
        firstName: 'Rohan', lastName: 'Desai', dept: 'ECE', batch: '2025',
        skills: ['C++', 'Embedded Systems', 'MATLAB'],
        goals: ['IoT Engineer', 'Hardware Designer'],
        interests: ['IoT', 'Robotics']
      },
      {
        firstName: 'Kavya', lastName: 'Nair', dept: 'CSE', batch: '2024',
        skills: ['Java', 'Spring Boot', 'SQL'],
        goals: ['Backend Engineer', 'Cloud Architect'],
        interests: ['Cloud Computing', 'System Design']
      },
      {
        firstName: 'Arjun', lastName: 'Mehta', dept: 'ME', batch: '2025',
        skills: ['Python', 'Data Analysis', 'AutoCAD'],
        goals: ['Product Manager', 'Data Analyst'],
        interests: ['Product Management', 'Manufacturing']
      },
      {
        firstName: 'Diya', lastName: 'Joshi', dept: 'IT', batch: '2024',
        skills: ['Python', 'TensorFlow', 'Statistics'],
        goals: ['Data Scientist', 'ML Engineer'],
        interests: ['Machine Learning', 'Data Science']
      }
    ];

    const studentUsers = [];
    for (let i = 0; i < studentData.length; i++) {
      const s = studentData[i];
      const user = await User.create({
        email: `student${i + 1}@alumni.network`,
        password: 'Password@123',
        role: 'student',
        firstName: s.firstName,
        lastName: s.lastName,
        department: s.dept,
        batch: s.batch
      });
      await Profile.create({
        user: user._id,
        headline: `${s.dept} Student | Batch ${s.batch}`,
        skills: s.skills,
        careerGoals: s.goals,
        interests: s.interests
      });
      studentUsers.push(user);
    }

    // 4. Opportunities
    const opportunityData = [
      {
        title: 'Software Engineer Intern', company: 'Google', type: 'internship',
        desc: 'Join our team to build large-scale distributed systems. Work on impactful projects with world-class engineers.',
        reqs: ['Data Structures & Algorithms', 'Any programming language', 'Problem-solving skills'],
        remote: false
      },
      {
        title: 'Full Stack Developer', company: 'Microsoft', type: 'job',
        desc: 'Design and develop customer-facing web applications using modern frameworks and Azure cloud services.',
        reqs: ['React or Angular', 'Node.js or .NET', '1+ year experience'],
        remote: true
      },
      {
        title: 'Product Management Intern', company: 'Amazon', type: 'internship',
        desc: 'Drive product development for a new consumer-facing feature. Work with engineering and design teams.',
        reqs: ['Strong analytical skills', 'Communication skills', 'MBA or final year B.Tech'],
        remote: false
      },
      {
        title: 'Data Analyst', company: 'Flipkart', type: 'job',
        desc: 'Analyze user behavior data to drive business decisions. Build dashboards and automate reporting.',
        reqs: ['SQL proficiency', 'Python or R', 'Statistics knowledge'],
        remote: true
      },
      {
        title: 'Research Assistant - IoT Lab', company: 'IIT Research Lab', type: 'research',
        desc: 'Contribute to cutting-edge IoT research. Design and prototype sensor networks for smart cities.',
        reqs: ['Embedded systems knowledge', 'C/C++', 'Interest in research'],
        remote: false
      }
    ];

    for (let i = 0; i < opportunityData.length; i++) {
      const o = opportunityData[i];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30 + i * 10);
      await Opportunity.create({
        postedBy: alumniUsers[i]._id,
        title: o.title,
        company: o.company,
        type: o.type,
        description: o.desc,
        requirements: o.reqs,
        location: 'Bangalore',
        isRemote: o.remote,
        applicationDeadline: deadline,
        applicationLink: `https://careers.${o.company.toLowerCase().replace(/\s+/g, '')}.com`
      });
    }

    // 5. Events
    const eventData = [
      {
        title: 'Tech Talk: Building at Google Scale',
        desc: 'Learn about distributed systems, code review practices, and career growth at Google.',
        type: 'webinar', alumniIdx: 0
      },
      {
        title: 'Resume & Interview Workshop',
        desc: 'Hands-on workshop covering resume building, coding interviews, and behavioral rounds.',
        type: 'workshop', alumniIdx: 1
      },
      {
        title: 'Alumni Meetup: Career Paths in Tech',
        desc: 'Informal networking session with alumni from diverse tech roles. Q&A and career advice.',
        type: 'meetup', alumniIdx: 2
      }
    ];

    for (let i = 0; i < eventData.length; i++) {
      const e = eventData[i];
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 7 * (i + 1));
      await Event.create({
        createdBy: alumniUsers[e.alumniIdx]._id,
        title: e.title,
        description: e.desc,
        type: e.type,
        date: eventDate,
        startTime: '18:00',
        endTime: '19:30',
        isVirtual: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        maxAttendees: 100
      });
    }

    // 6. Admin notification
    await Notification.create({
      user: admin._id,
      type: 'SYSTEM',
      title: 'System Seeded',
      message: 'The database has been seeded with initial test data.'
    });

    console.log('\nSeed completed successfully!');
    console.log('\n--- Test Credentials ---');
    console.log('Admin:    admin@alumni.network / Admin@123');
    console.log('Alumni:   alumni1@alumni.network to alumni5@alumni.network / Password@123');
    console.log('Students: student1@alumni.network to student5@alumni.network / Password@123');
    console.log('------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seedData();
