import mongoose, { Schema } from "mongoose";

const clientProject = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "IN-PROGRESS", "REJECTED"],
      default: "PENDING",
    },
    budget: {
      type: Number,
      required: true,
    },
    hiddenForAdmin: {
      type: Boolean,
      default: false,
    },
    deletedByClient: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Project = mongoose.model("Project", clientProject);
