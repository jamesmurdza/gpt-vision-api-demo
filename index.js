const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors"); // Import the cors middleware

require("dotenv").config();

const app = express();
app.use(cors());

const port = process.env.PORT || 4000;

// Create the OpenAI client.
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Configure multer to store uploaded files in memory.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Google Cloud Storage client.
const storageClient = new Storage({
  projectId: process.env["GCS_PROJECT_ID"],
  keyFilename: "credentials.json",
});
const bucketName = `${process.env["GCS_PROJECT_ID"]}.appspot.com`;

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Make a unique directory to hold the uploaded file.
    const uuid = uuidv4();
    const file = req.file;
    const blob = storageClient
      .bucket(`gs://${bucketName}`)
      .file(uuid + "/" + file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error(err);
      res.status(500).send("Upload failed.");
    });

    blobStream.on("finish", async () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${uuid}%2F${file.originalname}?alt=media`;
      console.log(`File ${file.originalname} uploaded to ${url}.`);

      // Send the image to OpenAI with a prompt.
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "What is this?",
              },
              {
                type: "image_url",
                image_url: {
                  url: url,
                  detail: "auto",
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
      });

      res
        .status(200)
        .json({ response: response["choices"][0]["message"]["content"] });
    });
    blobStream.end(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});