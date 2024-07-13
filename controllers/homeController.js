const User = require('../models/user')
const Company = require('../models/Company')
const Admin = require('../models/admin')


const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWTSECRET


// check Login 


const home_page = (req, res) => {
  res.render("index", { title: "Login Page" ,error: ""});
};







// =================================== Sign UP===================== //


const signUp_get = (req, res) => {
  res.render("sign-up", { title: "Sign Up Page", Email: '', Password: '', error: "" });
};


const signUp_post = async (req, res) => {
  const {
    userType
  } = req.body;

  if (userType === "company") {
    res.redirect("/companyReg");
  } else {
    res.redirect("/userReg");
  }
};



const companyReg_get = (req, res) => {
  res.render("companyReg", { title: "Company Registration Page", Email: '', Password: '', error: "" });
};

const companyReg_post = async (req, res) => {
  const {
    companyEmail,
    password,
    companyName,
    companyCategory,
    companySize,
    address,
    Apartment,
    city,

    country,
    companyPhone,
    companyDescription,
    companyLogo,
    companyCover,
    FaceBookLink,
    XLink,
    InstagramLink,
    LinkedInLink,
    companyAdmins,
    companyProjects,
  } = req.body;


  const hashedPassword = await bcrypt.hash(password, 10)
  const company = new Company({

    companyEmail,
    password : hashedPassword,
    companyName,
    companyCategory,
    companySize,
    companyLocation: {
      street: address || "",
      Apartment: Apartment || "",
      city: city || "",
      
      country: country || "",

    },
    companyPhone,
    companyDescription,
    companyLogo,
    companyCover,
    companySocials: {
      facebook: FaceBookLink,
      X: XLink,
      instagram: InstagramLink,
      linkedin: LinkedInLink,

    },
    companyAdmins,
    companyProjects,
  });

  try {
    const savedCompany = await company.save();
    console.log(savedCompany);
    res.status(201).redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }

};


const userReg_get = (req, res) => {
  res.render("userReg", { title: "User Registration Page", Email: '', Password: '', error: "" });
};

const userReg_post = async (req, res) => {
  const {
    userName,
    userEmail,
    userPassword,
    userGender,
    userAge,
    userBio,
    coverPhoto,
    profilePicture,
    FaceBookLink,
    XLink,
    InstagramLink,
    LinkedInLink,
    address,
    Apartment,
    city,
    
    country,

  } = req.body;
  const hashedPassword = await bcrypt.hash(userPassword,10)

  const user = new User({
    userEmail : userEmail,
    password :  hashedPassword,
    userName : userName || "",
    userGender : userGender || "",
    userAge: userAge || "",
    userBio : userBio || "",
    userLocation: {
      street: address || "",
      Apartment: Apartment || "",
      city: city || "",
      
      country: country || "",


    },
    balance : 0,

    profilePicture : profilePicture || "",
    coverPhoto :  coverPhoto || "",
    userSocials: {
      facebook: FaceBookLink || "",
      X: XLink || "",
      instagram: InstagramLink || "",
      linkedin: LinkedInLink || "",

    },
  });

  try {
    const userSaved = await user.save();
    console.log(userSaved);
    res.status(201).redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }

};



// =================================== END Sign UP===================== //


// =================================== Sign IN ====================== //





const login_post = async (req, res) => {
  try {
    const { 
      Email,
      Password ,
      userType 
    } = req.body;
    let adminRole = false
    if (!userType) {
       adminRole = true
    }

    let user = null
    if (userType=="user") {
       user = await User.findOne( { userEmail: Email });
    }else if (userType=="company"){
       user = await Company.findOne( { companyEmail: Email });
    }else if (adminRole){
      user = await Admin.findOne( { adminEmail: Email });

    }

 


    if (!user) {
      return res.status(401).render("index", { title: "Login Page", Email: "", Password: null, error: "Email or Password inccorrect or make correct selection " });
    }

    const isPasswordValid = await bcrypt.compare(Password, user.password);

    if (!isPasswordValid) {
      return res.status(401).render("index", { title: "Login Page", Email: "", Password: null, error:  "Email or Password inccorrect or make correct selection" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);

    res.cookie('token', token, { httpOnly: true });
    
    if (userType == "company") {
      return res.redirect('/org/profile');
    } else if (userType == "user") {
      return res.redirect('/user/dashboard');
    } else if (adminRole) {
      return res.redirect('/admin/dashboard');
    }

  } catch (error) {
    console.log(error);
    return res.status(500).redirect('/');
  }
}

const addAdmin = async (req, res) => {
  try {
    const { name,
      email,
      password,
                          } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = new Admin({
      adminName : name,
      password :  hashedPassword,
      adminEmail : email,
    })
    await admin.save()
    res.status(201).send('Admin Added')
  } catch (error) {
    console.log(error)
    res.status(500).send('Internal Server Error')
  }
}
    
    





module.exports = {
  home_page,


  signUp_get,
  signUp_post,

  companyReg_get,
  companyReg_post,

  userReg_get,
  userReg_post,


  login_post,


  addAdmin,

};


