const mongoose = require("mongoose");
const User = require("./User");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    last_name: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (email) => emailRegex.test(email),
        message: "Please provide a valid email address",
      },
    },

    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Salary must be a valid number",
      },
    },

    date_of_joining: {
      type: Date,
      required: [true, "Date of joining is required"],
      validate: {
        validator: (date) => !Number.isNaN(date.getTime()),
        message: "Please provide a valid joining date",
      },
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee owner is required"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Verify that the employee owner exists in MongoDB.
employeeSchema.pre("validate", async function () {
  if (!this.user || !mongoose.isValidObjectId(this.user)) {
    return;
  }

  const ownerExists = await User.exists({ _id: this.user });

  if (!ownerExists) {
    this.invalidate("user", "Employee owner does not exist");
  }
});

module.exports = mongoose.model("Employee", employeeSchema);