const { urlencoded } = require("express");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const {
  Akses,
  Create,
  FindContact,
  Hapus,
  CheckNama,
  Edit,
} = require("./utils/pinjam.js");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);

//Middleware
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(express.static("public"));
app.use(urlencoded({ extended: true }));

//Route Home
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/template",
  });
});

//Route Contact
app.get("/pinjam", (req, res) => {
  const load = Akses();
  res.render("pinjam", {
    layout: "layouts/template",
    msg: req.flash("msg"),
    load,
  });
});

//Route Tambah Contact
app.get("/pinjam/create", (req, res) => {
  res.render("create", {
    layout: "layouts/template",
  });
});

//Proses Tambah Contact
app.post(
  "/pinjam",
  [
    body("nama").custom((value) => {
      const cek = CheckNama(value);
      if (cek) {
        throw new Error("Nama Sudah Terdaftar");
      }
      return true;
    }),
    check("nohp", "No Hp Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("create", {
        layout: "layouts/template",
        errors: errors.array(),
      });
    } else {
      const selectedKendaraan = req.body.kendaraan;
      const kendaraanNopolMap = {
        "Honda Mobilio": "B 3774 PPU",
        "Toyota Avanza": "B 8441 SIF",
        "Daihatsu Granmax": "B 9932 DWO",
      };
      const nopol = kendaraanNopolMap[selectedKendaraan] || "";

      Create({ ...req.body, nopol });
      req.flash("msg", "Data Berhasil di Tambahkan");
      res.redirect("/pinjam");
    }
  }
);

//Route Hapus Contact
app.get("/pinjam/delete/:nama", (req, res) => {
  const hps = FindContact(req.params.nama);

  //Jika Tidak Ada Nama Yang Sesuai
  if (!hps) {
    res.status(404);
    res.redirect("/errors");
  } else {
    Hapus(req.params.nama);
    req.flash("msg", "Data Berhasil di Hapus");
    res.redirect("/pinjam");
  }
});

//Route Edit Contact
app.get("/pinjam/edit/:nama", (req, res) => {
  const val = FindContact(req.params.nama);
  res.render("edit", {
    layout: "layouts/template",
    val,
  });
});

//Proses Edit Contact
app.post(
  "/pinjam/update",
  [
    body("nama").custom((value, { req }) => {
      const cek = CheckNama(value);
      if (value !== req.body.OldName && cek) {
        throw new Error("Nama Sudah Terdaftar");
      }
      return true;
    }),
    check("nohp", "No Hp Tidak Valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit", {
        layout: "layouts/template",
        errors: errors.array(),
        val: req.body,
      });
    } else {
      const selectedKendaraan = req.body.kendaraan;
      const kendaraanNopolMap = {
        "Honda Mobilio": "B 3774 PPU",
        "Toyota Avanza": "B 8441 SIF",
        "Daihatsu Granmax": "B 9932 DWO",
      };
      const nopol = kendaraanNopolMap[selectedKendaraan] || "";

      Edit({ ...req.body, nopol });
      req.flash("msg", "Data Berhasil di Ubah");
      res.redirect("/pinjam");
    }
  }
);

//Route Details Contact
app.get("/pinjam/:nama", (req, res) => {
  const find = FindContact(req.params.nama);
  res.render("details", {
    layout: "layouts/template",
    find,
  });
});

//Route Error Handling
app.use("/", (req, res) => {
  res.status(404);
  res.render("errors", {
    layout: "layouts/template",
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
