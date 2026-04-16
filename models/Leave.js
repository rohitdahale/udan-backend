import mongoose from 'mongoose';

const leaveSchema = mongoose.Schema(
  {
    empId: {
      type: String, // String ID matching Employee schema
      required: true,
    },
    empName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    reason: {
      type: String,
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // API contract from api.js uses native id for leave records usually
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
