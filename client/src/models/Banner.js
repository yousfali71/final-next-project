import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a banner title"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    image: {
      public_id: String,
      url: {
        type: String,
        required: [true, "Please provide a banner image"],
      },
    },
    link: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "Shop Now",
    },
    position: {
      type: String,
      enum: ["hero", "middle", "bottom"],
      default: "hero",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
