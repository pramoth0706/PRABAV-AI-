import "dotenv/config"
import express from "express"
import cors from "cors"
import Groq from "groq-sdk"
import axios from "axios"
import multer from "multer"
import fs from "fs"

const app = express()

app.use(cors())
app.use(express.json())

const upload = multer({
  dest: "uploads/",
})

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

/* ---------------- WEB SEARCH ---------------- */

async function webSearch(query) {
  const response = await axios.get(
    "https://serpapi.com/search.json",
    {
      params: {
        q: query,
        api_key:
          process.env.SERPAPI_KEY,
      },
    }
  )

  return (
    response.data.organic_results
      ?.slice(0, 5)
      .map(
        (r) =>
          `${r.title}: ${r.snippet}`
      )
      .join("\n\n") ||
    "No results found"
  )
}

/* ---------------- READ FILE ---------------- */

function readFile(filename) {
  return fs.readFileSync(
    `uploads/${filename}`,
    "utf8"
  )
}

/* ---------------- FILE UPLOAD ---------------- */

app.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      res.send({
        success: true,
        filename:
          req.file.filename,
        originalName:
          req.file.originalname,
      })
    } catch (error) {
      console.log(error)

      res.status(500).send(
        "Upload failed"
      )
    }
  }
)

/* ---------------- CHAT ROUTE ---------------- */

app.post("/chat", async (req, res) => {
  try {
    const {
      messages,
      uploadedFile,
    } = req.body

    console.log(
      "Uploaded File:",
      uploadedFile
    )

    const userMessage =
      messages[messages.length - 1]
        ?.content || ""

    console.log(
      "User Message:",
      userMessage
    )

    /* ---------- SUMMARIZE FILE ---------- */

    if (
      userMessage
        .toLowerCase()
        .includes("summarize") &&
      uploadedFile
    ) {
      console.log(
        "SUMMARIZE TRIGGERED"
      )

      const fileContent =
        readFile(uploadedFile)

      console.log(
        "FILE CONTENT:",
        fileContent
      )

      const response =
        await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are PRABAV. Summarize the uploaded document.",
            },
            {
              role: "user",
              content: `
Document:

${fileContent}

Summarize this document.
`,
            },
          ],

          model:
            "llama-3.3-70b-versatile",

          temperature: 0.7,
        })

      return res.send(
        response.choices[0].message
          .content
      )
    }

    /* ---------- TOKEN INFO ---------- */

    const estimatedTokens =
      Math.ceil(
        JSON.stringify(messages)
          .length / 4
      )

    console.log(
      "Estimated Tokens:",
      estimatedTokens
    )

    const estimatedCost =
      estimatedTokens * 0.000001

    console.log(
      "Estimated Cost: $",
      estimatedCost.toFixed(6)
    )

    /* ---------- WEB SEARCH ---------- */

    const searchKeywords = [
      "latest",
      "today",
      "current",
      "news",
      "ipl",
      "cricket",
      "winner",
      "won",
      "qualifier",
      "points",
      "table",
      "score",
      "standings",
      "weather",
      "stock",
      "price",
    ]

    const needsSearch =
      searchKeywords.some((word) =>
        userMessage
          .toLowerCase()
          .includes(word)
      )

    console.log(
      "Needs Search:",
      needsSearch
    )

    if (needsSearch) {
      const searchResults =
        await webSearch(userMessage)

      const response =
        await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are PRABAV and must answer using the search results.",
            },
            {
              role: "user",
              content: `
Question:
${userMessage}

Search Results:
${searchResults}

Answer using the search results.
`,
            },
          ],

          model:
            "llama-3.3-70b-versatile",

          temperature: 0.7,
        })

      return res.send(
        response.choices[0].message
          .content
      )
    }

    /* ---------- NORMAL CHAT ---------- */

    const completion =
      await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are PRABAV, a friendly AI assistant who remembers previous conversations and explains concepts clearly.",
          },

          ...messages,
        ],

        model:
          "llama-3.3-70b-versatile",

        temperature: 0.7,
      })

    return res.send(
      completion.choices[0].message
        .content
    )
  } catch (error) {
    console.log(error)

    res.status(500).send("Error")
  }
})

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  )
})

