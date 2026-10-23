import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Project } from "../models/project.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createProject = asyncHandler(async (req, res) => {
  const { title, description, budget } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof budget !== "number" ||
    !Number.isFinite(budget) ||
    budget <= 0
  ) {
    throw new ApiError(400, "Valid title, description and budget are required");
  }

  if (req.user.role !== "client") {
    throw new ApiError(403, "Only client can create projects");
  }

  const project = await Project.create({
    client: req.user._id,
    title: title.trim(),
    description: description.trim(),
    budget,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { project }, "Project created successfully"));
});

const getMyProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (req.user.role !== "client") {
    throw new ApiError(403, "Only clients can access their projects");
  }

  const projects = await Project.find({
    client: userId,
    deletedByClient: { $ne: true },
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { projects }, "Projects fetched successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, budget } = req.body;

  const project = await Project.findById(id);

  if (project.client.toString() !== req.user._id.toString()) {
    throw new ApiError(400, "You are not allowed to update this project");
  }

  if (title) project.title = title; // agr new title ni bhaija to purana title rhay ga
  if (description) project.description = description;
  if (budget) project.budget = budget;

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (req.user.role === "admin") {
    project.hiddenForAdmin = true;
  } else if (req.user.role === "client") {
    if (project.client.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You cannot delete this project");
    }

    project.deletedByClient = true;
  } else {
    throw new ApiError(403, "Unauthorized");
  }

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { project }, "Project deleted successfully"));
});

// const acceptProject = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { id } = req.params;

//   if (req.user.role !== "freelancer") {
//     throw new ApiError(403, "Only freelancer can accept this project");
//   }

//   const project = await Project.findById(id);
//   if (!project) {
//     throw new ApiError(404, "Project not found");
//   }

//   if (project.freelancer) {
//     throw new ApiError(403, "Project already accepted");
//   }

//   if(project.client.toString() === userId.toString()){
//     throw new ApiError(400, "You can not accept your own project")
//   }

//   project.freelancer = userId;
//   project.status = "IN-PROGRESS";
//   await project.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Project accepted successfully"));
// });

const updateProjectStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can update projects");
  }

  // if (project.admin.toString() !== req.user._id.toString()) {
  //   throw new ApiError(403, "You are not allowed to update this project");
  // }

  const validStatus = ["PENDING", "COMPLETED", "IN-PROGRESS", "REJECTED"];
  if (!validStatus.includes(status)) {
    throw new ApiError(400, "Invalid Status");
  }

  project.status = status;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, status, "Status updated successfully"));
});

const getAllProjects = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can access all projects");
  }

  const projects = await Project.find({
    hiddenForAdmin: { $ne: true },
  })
    .populate("client", "firstName")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { projects }, "All projects fetched successfully"),
    );
});

const getAllClients = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "client" })
    .select("firstName, lastName, email, createdAt")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "All clients fetched successfully"));
});

export {
  createProject,
  getMyProjects,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getAllProjects,
  getAllClients,
};
