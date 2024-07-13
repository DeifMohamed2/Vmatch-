
const Company = require('../models/Company');
const Project = require('../models/project');
const User = require('../models/user');
const Admin = require('../models/admin');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: 'mrcb qdcn vjgy bkon'
  }
});







const tables_get = async (req, res) => {
  try {

    res.render("admin/tables", { title: "Tables", path: req.path });
  } catch (error) {
    res.send(error.message);
  }
};






const billing_get = async (req, res) => {
  try {

    res.render("admin/billing", { title: "Billing", path: req.path , adminData: req.userData});
  } catch (error) {
    res.send(error.message);
  }
}



const billing_post = async (req, res) => {
  try {
    const { amount } = req.body;

    const userId = req.userData._id;
    const user = await Admin.findOneAndUpdate({ _id: userId }, { $inc: { balance: -amount } });


    res.redirect("/admin/billing");
  } catch (error) {
    res.send(error.message);
  }
}






// ========================= DashBoard ========================= //


const dash_get = async (req, res) => {
  try {
    let events = null;
    let filter = req.session.filter || 'all'; // Get the last saved filter option from the session

    if (!Array.isArray(filter)) {
      filter = [filter]; // Convert to array if only one option is selected
    }

    if (filter.includes('all')) {
      events = await Project.find({}).populate('projectOwner').populate('projectOwner'); 
    } else {
      events = await Project.find({ projectStatus: 'Pending' }).populate('projectOwner'); 
    }
    console.log(events);
    res.render("admin/dash", { title: "DashBoard", path: req.path, events: events, userData: req.userData, filter: filter });
  } catch (error) {
    res.send(error.message);
  }
};


const filterEvents = async (req, res) => {
  try {
    let { filter } = req.body;
    req.session.filter = filter; // Save the filter option in the session
    let events = null;
    if (!Array.isArray(filter)) {
      filter = [filter]; // Convert to array if only one option is selected
    }


    if (filter.includes('all')) {
      events = await Project.find({}).populate('projectOwner');
    } else {
      events = await Project.find({ projectStatus: 'Pending' }).populate('projectOwner'); 
    }

    console.log(events);
    res.render("admin/dash", { title: "DashBoard", path: req.path, events: events, userData: req.userData, filter: filter });
  } catch (error) {
    res.send(error.message);
  }
}


// =========================END DashBoard ========================= //







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



    res.render("admin/manageProject", { title: "Manage Project", path: req.path, project: project, projectParticipants: projectParticipants, totalApplied: projectParticipants.length || 0, pendingCount: pendingCount || 0, acceptedCount: acceptedCount ||0 });
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
      eventPaymentStatus,
      eventCataegory,
      EventStatus,
      eventPrice,
      eventCapacity,
    } = req.body;
    const userId = req.userData._id;
    console.log('EventStatus', EventStatus)
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
      projectStatus: EventStatus,
      projectPrice: parseInt(eventPrice) || 0,
      projectLocation: {
      street: Adress,
      city: city,
      country: country,
      },
      projectCapacity: parseInt(eventCapacity),
      projectPaymentStatus: eventPaymentStatus,
    }).then(async(result) => {
      console.log(eventPaymentStatus)
      console.log('result', result);
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
      

    res.redirect('/admin/manageProject/' + projectId);
  }
  catch (error  ) {
    res.send(error.message);
  }
    
}

// ========================= END Manage Project ========================= //










const logOut = async (req, res) => {
  // Clearing the token cookie
  res.clearCookie('token');
  // Redirecting to the login page or any other desired page
  res.redirect('/');
}



module.exports = {
  dash_get,
  filterEvents,

  tables_get,

  billing_get,
  billing_post,



  manageProject_get,
  manageProject_EditEvent,
  manageProject_editUserStatus,

  logOut,
};
