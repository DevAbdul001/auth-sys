const { z } = require("zod");

const UserSchema = z.object({
  email: z.string().email("Invalid email format"),
  passwordHash: z.string().min(1, "Password hash is required"),
  role_id: z.number().int().optional().default(2)
});

module.exports = { UserSchema };
