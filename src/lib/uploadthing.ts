import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1
    } 
  })
    .middleware(async () => {
      // This is where you can add authentication if needed
      return {};
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for file:", file.name);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter; 