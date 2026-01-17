const Project = require("../models/Project");

exports.createProject = async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description,
    owner: req.user.id,
    members: [req.user.id]
  });
  res.status(201).json(project);
};

exports.getMyProjects = async (req, res) => {
  const projects = await Project.find({ members: req.user.id });
  res.json(projects);
};
