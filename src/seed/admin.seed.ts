import bcrypt from "bcrypt";
import User from "../modules/auth.module";

export async function seedAdmin() {
  try {
    if (
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PASSWORD ||
      !process.env.ADMIN_NAME
    ) {
      throw new Error(
        "Missing ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD in environment",
      );
    }

    const adminExists = await User.findOne({ role: "ADMIN" });

    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);

    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin account created");
  } catch (error) {
    console.error("Failed to seed admin:", error);
  }
}
