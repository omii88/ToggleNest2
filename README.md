# ToggleNest

**ToggleNest** is a collaborative task and workflow management platform that enables teams to plan, organize, 
and execute projects efficiently.
It features a clean, Kanban-inspired interface where users can toggle between tasks, assign responsibilities,
and monitor project progress in real time.

Designed for both students and professional teams, ToggleNest simplifies 
team coordination through intuitive design, progress visualization, and seamless collaboration.

---

## 🌐 Live Links
- **Frontend (Netlify):** https://togglenest.netlify.app  
- **Backend (Railway):** https://togglenest2-production.up.railway.app  
- **GitHub Repository:** https://github.com/omii88/ToggleNest2.git  

---

## Table of Contents
- [Overview](#overview)
- [Project Goals](#project-goals)
- [Technical Scope](#technical-scope)
- [Core Features](#core-features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributors](#contributors)

---

## Overview
ToggleNest is a **full-stack MERN project management tool** that supports multi-user collaboration.
Users can create projects, assign tasks, visualize progress using Kanban boards, and track activities in real time.

---

## Project Goals
- Develop a MERN-based collaborative project management platform  
- Enable task creation, assignment, and tracking across projects  
- Implement Kanban-style drag-and-drop boards  
- Provide role-based access and activity logging  
- Design a responsive and user-friendly interface  

---

## Technical Scope
- **Frontend:** React.js (**React 19 beta**, Vite)  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT-based authentication  
- **Drag-and-drop:** **Hello Pangea DnD**  
  - React Beautiful DnD–compatible  
  - Used due to **React 19 compatibility**  
  - *React DnD can also be used as an alternative*  
- **API:** RESTful APIs for users, projects, and tasks  

---

## Core Features
1. **User Roles & Authentication** – Secure signup/login for team members  
2. **Project Creation** – Manage multiple projects with descriptions and deadlines  
3. **Task Board** – Kanban board (To-Do, In Progress, Done)  
4. **Task Assignment** – Assign users, set priorities, and due dates  
5. **Progress Dashboard** – Track completion status and pending tasks  
6. **Activity Log** – Monitor updates and task movements    

---

## Installation
# Clone the repository
git clone https://github.com/omii88/ToggleNest2.git

# Backend setup
cd backend-->
npm install-->
npm start

# Frontend setup
cd ../frontend-->
npm install-->
npm run dev

---Frontend runs on: http://localhost:5173 (Vite default)
---Backend runs on: http://localhost:5000

Usage
--Open the frontend (local or live link)
-->Sign up or log in
-->Create a project
-->Add and assign tasks
-->Drag tasks across the Kanban board to update progress
