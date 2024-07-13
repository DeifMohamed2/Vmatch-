
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Project = require('../models/project');
const User = require('../models/user');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: 'mrcb qdcn vjgy bkon'
  }
});


// ==================  Dash  ====================== //

const dash_get = async (req, res) => {
  try {

    res.render("org/dash", { title: "Dash board", path: req.path });
  } catch (error) {
    res.send(error.message);
  }
};


const tables_get = async (req, res) => {
  try {

    res.render("org/tables", { title: "Tables", path: req.path });
  } catch (error) {
    res.send(error.message);
  }
};





//  ================== END  Billing ==================  //

const billing_get = async (req, res) => {
  try {


    res.render("org/billing", { title: "Billing", path: req.path ,company: req.userData });
  } catch (error) {
    res.send(error.message);
  }
}





const billing_post = async (req, res) => {
  try {
    const { amount } = req.body;

    const userId = req.userData._id;
    const user = await Company.findOneAndUpdate({ _id: userId }, { $inc: { balance: -amount } });


    res.redirect("/org/billing");
  } catch (error) {
    res.send(error.message);
  }
}



//  ================== END  Billing ==================  //





// ========================= Profile ========================= //

const profile_get = async (req, res) => {
  try {

   

    const projects = await Project.find({ projectOwner: req.userData._id });
   

    res.render("org/profile", { title: "Profile", path: req.path, orgData: req.userData , projects: projects}); 
  } catch (error) {
    res.send(error.message);
  }
};


const updateProfile = async (req, res) => {
  try {
    const {
      BGURL,
      LogoURL,
      companyName,
      companyDescription,
      phoneNumber,
      Email,
      Location,
    } = req.body;
    const userId = req.userData._id;

    let country = null
    let city  = null
  
    if (Location != undefined) {
      

    let [countrySplited, citySplited, ...rest] = Location.split(',').map((item) => item.trim());

    const extraInfo = rest.length > 0 ? `, ${rest.join(', ')}` : '';

     country = countrySplited;
     city = citySplited
  }


     await Company.updateOne({ _id: userId }, 
       {
        companyName : companyName||req.userData.companyName,
        companyDescription : companyDescription||req.userData.companyDescription,
        companyPhone : phoneNumber||req.userData.companyPhone,
        companyEmail : Email||req.userData.companyEmail,
        companyLocation : {
          street: req.userData.companyLocation.street,
          state: req.userData.companyLocation.state,
          Apartment : req.userData.companyLocation.Apartment,

          city: city||req.userData.companyLocation.city,
    
          country: country||req.userData.companyLocation.country,
        },
        companyLogo : LogoURL||req.userData.companyLogo,
        companyCover : BGURL||req.userData.companyCover,

       });

    res.redirect("/org/profile");
  } catch (error) {
    res.send(error.message);
  }
}


const AddEvent = async (req, res) => {
  try {
    const {
      projectPhoto,
      eventName,
      eventDescription,
      eventDate,
      StartTime,
      EndTime,
      eventLocation,
      eventCataegory,
      eventPaymentStatus,
      eventPrice,
      eventCapacity,
      projectURL,
    } = req.body;
    const userId = req.userData._id;

    let [countrySplited, citySplited, AdressSploited,...rest] = eventLocation.split(',').map((item) => item.trim());

    const extraInfo = rest.length > 0 ? `, ${rest.join(', ')}` : '';

    const country = countrySplited;
    const  city = citySplited
    const  Adress = AdressSploited + extraInfo

   const project =  await Project.create({
      projectName: eventName,
      projectOwner: userId,
      projectDescription :eventDescription,
      projectDate: eventDate,
      projectCover: projectPhoto,
      // eventURL: eventURL,
      projectCategory: eventCataegory,
      // projectStatus: eventPaymentStatus,
      projectTimeFrom :StartTime,
      projectTimeTo :EndTime,
      projectStatus: "Pending",
      projectPrice: eventPaymentStatus == "Free" ? 0 : parseInt(eventPrice),
      projectPaymentStatus : eventPaymentStatus,
      projectLocation: {
      street: Adress,
      city: city,
      country: country,
      },
      eventCapacity: parseInt(eventCapacity),
      projectParticipants:[],
      projectURL : projectURL ||"",
    }).then(async(project) => {
      console.log(project);
      await Company.updateOne({ _id: userId }, { $push: { companyProjects: project._id } });
    }
    );


    res.redirect("/org/profile");
  } catch (error) {
    res.send(error.message);
  }
}

// ========================= END Profile ========================= //


// ========================= Manage Project ========================= //

const manageProject_get = async (req, res) => {
  try {

    const projectId = req.params.projectId;
    const project = await Project.findOne({ _id: projectId })
    .populate({
      path: 'projectParticipants',
      model: 'User',
      select: 'userName profilePicture userEmail userAppliedProjects',
      match: { 'userAppliedProjects._id': projectId }

    });
     

    const projectParticipants = project.projectParticipants.map((item) => {

      return {
        _id: item._id,
        userName: item.userName,
        profilePicture: item.profilePicture,
        userEmail: item.userEmail,
        userAppliedProjects: item.userAppliedProjects.find((item) => item._id == projectId)
      }
    })

    const pendingCount = projectParticipants.filter((participant) => participant.userAppliedProjects.status === 'pending').length;
    const acceptedCount = projectParticipants.filter((participant) => participant.userAppliedProjects.status === 'Accepted').length;



    res.render("org/manageProject", { title: "Manage Project", path: req.path, project: project, projectParticipants: projectParticipants, totalApplied: projectParticipants.length || 0, pendingCount: pendingCount || 0, acceptedCount: acceptedCount ||0 });
  } catch (error) {
    res.send(error.message);
  }
}


const manageProject_EditEvent = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const {
      projectPhoto,
      eventName,
      eventDescription,
      eventDate,
      StartTime,
      EndTime,
      eventLocation,
              
      eventCataegory,
 
      eventCapacity,
      projectURL,
    } = req.body;

    let [countrySplited, citySplited, AdressSploited,...rest] = eventLocation.split(',').map((item) => item.trim());

    const extraInfo = rest.length > 0 ? `, ${rest.join(', ')}` : '';

    const country = countrySplited;
    const  city = citySplited
    const  Adress = AdressSploited + extraInfo

    await Project.updateOne({ _id: projectId }, {
      projectName: eventName,
      projectDescription :eventDescription,
      projectDate: eventDate,
      projectTime: `${parseInt(StartTime)} - ${parseInt(EndTime)}`,
      projectCover: projectPhoto,
      projectCategory: eventCataegory,

      projectLocation: {
      street: Adress,
      city: city,
      country: country,
      },
      projectCapacity: parseInt(eventCapacity),
      projectURL : projectURL ||"",
    });

    res.redirect(req.originalUrl);
  } catch (error) {
    res.send(error.message);
  }
}


const manageProject_editUserStatus = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.params.userId;
    const {newStatus} = req.body;


    const project = await Project.findOne({ _id: projectId })
    .populate({
      path: 'projectOwner',
      model: 'Company',
      select: 'companyName companyLogo'
   

    });
    console.log(project);

    await User.findOneAndUpdate({ _id: userId, 'userAppliedProjects._id': projectId }, { $set: { 'userAppliedProjects.$.status': newStatus } })
    .then(async(result) => {
       
        const mailOptions = {
          from: 'deifm81@gmail.com',
          to: `${result.userEmail}`,
          subject: `Project ${project.projectName} Status Updated`,
          html: `
            <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  padding: 20px;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #fff;
                  border-radius: 5px;
                  padding: 20px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                  background-color: #007bff;
                  color: #fff;
                  padding: 20px;
                  text-align: center;
                  border-top-left-radius: 5px;
                  border-top-right-radius: 5px;
                }
                .cover-photo {
                  width: 100%;
                  max-height: 200px;
                  object-fit: cover;
                  border-top-left-radius: 5px;
                  border-top-right-radius: 5px;
                }
                .content {
                  padding: 20px;
                }
                .footer {
                  background-color: #f4f4f4;
                  padding: 20px;
                  text-align: center;
                  border-bottom-left-radius: 5px;
                  border-bottom-right-radius: 5px;
                }
                .company-logo {
                  width: 50px;
                  height: 50px;
                  object-fit: cover;
                  border-radius: 50%;
                  margin-right: 10px;
                }
                .company-info {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-bottom: 20px;
                }
                .company-name {
                  font-size: 20px;
                  font-weight: bold;
                  color: #333;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Event Update</h1>
                </div>
                <img src="${project.projectCover}" alt="Event Cover Photo" class="cover-photo" />
                <div class="content">
                  <div class="company-info">
                    <img src="${project["projectOwner"].companyLogo}" alt="Company Logo" class="company-logo" />
                    <span class="company-name">${project["projectOwner"].companyName}</span>
                  </div>
                  <p>Hello,</p>
                  <p>This is to inform you that the status of project "${project.projectName}" has been updated.</p>
                  <p>Details of the update:</p>
                  <ul>
                    <li><strong>Status:</strong> ${newStatus}</li>
                    <li><strong>Description:</strong> ${project.projectDescription}</li>
                  </ul>
                  <p>Thank you for your attention.</p>
                </div>
                <div class="footer">
                  <p>Sent by  ${project["projectOwner"].companyName}</p>
                </div>
              </div>
            </body>
            </html>
          `
        };
        
        

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });

    });
      

    res.redirect('/org/manageProject/' + projectId);
  }
  catch (error  ) {
    res.send(error.message);
  }
    
}


const manageProject_deleteProject = async (req, res) => {


  try {

    
    const projectId = req.params.projectId;

    // Validate and cast the projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).send('Invalid project ID');
    }
    const objectId = new mongoose.Types.ObjectId(projectId);

    // // Find and delete the project
    const deletedProject = await Project.findByIdAndDelete(objectId);

    if (!deletedProject) {
      return res.status(404).send('Project not found');
    }

    // Update users to remove the deleted project from userAppliedProjects
    await User.updateMany(
      { 'userAppliedProjects._id': projectId },
      { $pull: { userAppliedProjects: { _id: projectId } } }
    );

    res.redirect('/org/profile');
  } catch (error) {
    res.status(500).send(error.message);
  }


};

// ========================= END Manage Project ========================= //



// ========================= user Profile ========================= //

const userProfile_get = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User .findOne({ _id: userId }).populate('userAppliedProjects._id');
    res.render("org/userProfile", { title: "Profile", path: req.path, userData: user, projectsApplied: user.userAppliedProjects });

  }
  catch (error ) {
    res.send(error.message);
  }

};


// ========================= END User Profile ========================= //



const logOut = async (req, res) => {
  // Clearing the token cookie
  res.clearCookie('token');
  // Redirecting to the login page or any other desired page
  res.redirect('/');
}



module.exports = {
  dash_get,
  tables_get,
  profile_get,

  billing_get,
  billing_post,


  // Profile
  updateProfile,

  AddEvent,

  manageProject_get,
  manageProject_EditEvent,
  manageProject_editUserStatus,
  userProfile_get,
  manageProject_deleteProject,

  logOut,
};
