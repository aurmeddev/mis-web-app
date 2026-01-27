import { IFormHeader } from "../Facebook.types";

export function FormHeader({ isUpdateMode }: IFormHeader) {
  return (
    <div className="mb-8 text-center">
      <h1 className="mb-2 font-semibold text-3xl tracking-tight">
        {isUpdateMode ? "Edit Pixel" : "Add Pixel"}
      </h1>
      <p className="text-balance text-muted-foreground">
        Fill out the form below to{" "}
        {isUpdateMode ? "update the existing" : "add your new"} pixel.
      </p>
    </div>
  );
}
