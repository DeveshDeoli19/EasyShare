require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const File = require("./models/File");


const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const upload = multer({ dest: "uploads" });

mongoose.connect(process.env.DATABASE_URL,()=>{
  console.log("Connected to DB")
});

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  const uniqueKey = req.body.number;
  const ifFile = await File.findOne({ uniqueKey });
  if (ifFile) {
    res.render("index", { txt: "choose different key" });
    return;
  }
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
    uniqueKey: req.body.number,
  };

  if (req.body.password != null && req.body.password !== "") {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }
  // console.log(fileData)
  const file = await File.create(fileData);
  // console.log(file)
  res.render("index", {
    fileLink: `${req.headers.origin}/file/${file.uniqueKey}`,
  });
});

app.route("/file/:id").get(handleDownload).post(handleDownload);

async function handleDownload(req, res) {
  // console.log(req.params.id);
  const uniqueKey = req.params.id;
  const file = await File.findOne({ uniqueKey });

    if(!file){
      res.status(404).json({
        success: false,
        message: "File no longer exist"
      })
      return
    }
  if (file.password != null) {
    if (req.body.password == null) {
      res.render("password");
      return;
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", { error: true });
      return;
    }
  }

  res.download(file.path, file.originalName);

  await File.deleteOne({ uniqueKey })
}

app.listen(process.env.PORT, () => {
  console.log(`Server is running at PORT: ${process.env.PORT}`);
});
