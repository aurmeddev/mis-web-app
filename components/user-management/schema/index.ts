import z from "zod";

export const userAccessFormSchema = z.object({
  full_name: z
    .string()
    .min(5, {
      message: "Full Name must contain at least 5 characters.",
    })
    .max(30, {
      message: "Full Name cannot exceed 30 characters.",
    }),
  display_name: z.string().optional(),
  email: z.email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .max(160, {
      message: "Password cannot exceed 160 characters.",
    })
    .min(4, {
      message: "Password must contain at least 4 characters.",
    }),
  gender: z.string().min(1, { message: "Please select a Gender." }),
  user_type: z.string().min(1, { message: "Please select a User Type." }),
  team: z.string().min(1, { message: "Please select a Team." }),
  main_menu: z
    .array(z.string())
    .min(1, { message: "Please select at least one Main Menu item." }),
  sub_menu: z
    .array(z.string())
    .min(1, { message: "Please select at least one Sub Menu item." }),
  brand: z.array(z.string()).optional(),
  // .min(1, { message: "Please select at least one Brand." }),
});
