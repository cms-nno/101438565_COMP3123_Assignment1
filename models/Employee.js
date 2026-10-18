
const mongoose = require("mongoose");
const User = require("./User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [1, "First name cannot be empty"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [1, "Last name cannot be empty"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      validate: {
        validator: (email) =>
          typeof email === "string" && emailRegex.test(email),
        message: "Please provide a valid email address",
      },
    },

    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      minlength: [1, "Position cannot be empty"],
      maxlength: [100, "Position cannot exceed 100 characters"],
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      validate: {
        validator: (salary) =>
          typeof salary === "number" && Number.isFinite(salary),
        message: "Salary must be a valid finite number",
      },
    },

    date_of_joining: {
      type: Date,
      required: [true, "Date of joining is required"],
      validate: {
        validator: (date) =>
          date instanceof Date && !Number.isNaN(date.getTime()),
        message: "Please provide a valid joining date",
      },
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      minlength: [1, "Department cannot be empty"],
      maxlength: [100, "Department cannot exceed 100 characters"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee owner is required"],
      validate: {
        validator: (id) => mongoose.isValidObjectId(id),
        message: "Employee owner must be a valid user ID",
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    strict: "throw",
  }
);

// Verify that the referenced owner exists.
employeeSchema.pre("validate", async function () {
  if (!this.user || !mongoose.isValidObjectId(this.user)) {
    return;
  }

  const ownerExists = await User.exists({
    _id: this.user,
  });

  if (!ownerExists) {
    this.invalidate("user", "Employee owner does not exist");
  }
});

module.exports = mongoose.model("Employee", employeeSchema);
