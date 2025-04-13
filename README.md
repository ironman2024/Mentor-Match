🤝 Match Mentor
Empowering student-mentor collaboration through intelligent matchmaking and real-time communication.
Developed during Hacksprint v6.0 by Atharva Karval, Om Dalbhanjan, and Samarth Patil.

🌟 Overview
Match Mentor addresses the challenges engineering students face in finding suitable mentors and forming balanced teams for projects, competitions, and hackathons. By leveraging a microservices architecture and a MongoDB cluster, the platform offers intelligent matchmaking, real-time communication, and collaborative tools to foster an engaging ecosystem for students and mentors.​

🎯 Problem Statement
Engineering students across different years often struggle to find the right mentors or assemble well-balanced teams for projects, competitions, and hackathons. This leads to missed opportunities for learning, innovation, and peer collaboration.​

Your challenge is to build a platform that allows students to:

Showcase their skills.​

Connect with mentors.​
Up For Grabs
+1
Refonte Learning
+1

Intelligently form teams based on skill compatibility and project requirements.​

The system should also include incentive mechanisms—like badges, reputation scores, or leaderboards—to encourage mentorship and active participation. The goal is to create an engaging ecosystem that empowers students to collaborate and grow together.​

🚀 Features
Microservices Architecture: Ensures scalability and maintainability by dividing the application into independent services.​

MongoDB Cluster: Utilizes a MongoDB cluster for robust and scalable data storage.​

Real-Time Chat: Facilitates instant communication between users using WebSockets.​

Post Feature: Allows users to share updates, ideas, and project progress with the community.​

Mentor Rating System: Enables students to rate mentors, promoting quality mentorship.​

Event Creation: Organizers can create events for students to participate in.​

Project Publishing: Users can publish their projects and find suitable team members and mentors.​

Intelligent Team Formation: Matches students and mentors based on skills and project requirements.​

Google Meet Integration: Allows direct video calls between students and mentors via Google Meet.​

🛠️ Tech Stack
Frontend: React, TypeScript, HTML​

Backend: Node.js, Express​
GitHub
+1
LinkedIn
+1

Database: MongoDB Cluster​
Up For Grabs

Architecture: Microservices​

Real-Time Communication: WebSockets​
GitHub

Deployment: Docker, AWS​

📸 Screenshots
Include relevant screenshots here to showcase the platform's interface and features.

📦 Installation
Prerequisites
Node.js and npm installed on your machine.​

Docker installed for containerization.​

Steps
bash
Copy
Edit
# Clone the repository
git clone https://github.com/ironman2024/hacksprint.git

# Navigate to the project directory
cd hacksprint
cd campus-connect
# Install dependencies for each microservice
# for a service named 'Frontend'
cd frontend
npm install
npm run dev
# Example for a service named 'backend'
cd backend
npm install
npm run dev

# Repeat for other services...

# Start all services using Docker Compose
docker-compose up
Ensure you have configured environment variables as required for each service.

🧑‍💻 Contributing
We welcome contributions from the community! To contribute:

Fork the repository.​

Create a new branch: git checkout -b feature/YourFeature​

Commit your changes: git commit -m 'Add YourFeature'​

Push to the branch: git push origin feature/YourFeature​

Open a pull request.​

Please refer to our CONTRIBUTING.md for more details.

📄 License
This project is licensed under the MIT License.​

🙌 Acknowledgements
Thanks to all the contributors who have helped in building this platform.​

Special mention to the hackathon community for their continuous support and feedback.
