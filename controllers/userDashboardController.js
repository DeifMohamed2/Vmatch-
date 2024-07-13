
const mongoose = require('mongoose');
const User = require('../models/user');
const Project = require('../models/project');
const Company = require('../models/Company');
const Admin = require('../models/admin');
const sweetalert = require('sweetalert');


// ==================  Dash  ====================== //



const tables_get = async (req, res) => {
  try {

    res.render("user/tables", { title: "Tables", path: req.path });
  } catch (error) {
    res.send(error.message);
  }
};



// ========================= DashBoard ========================= //


const dash_get = async (req, res) => {
  try {
    let events = null;
    let interests = req.userData.userInterests;
    let filter = req.session.filter || 'all'; // Get the last saved filter option from the session

    if (!Array.isArray(filter)) {
      filter = [filter]; // Convert to array if only one option is selected
    }

    if (filter.includes('all')) {
      events = await Project.find({ projectStatus: 'Accepted' }).populate('projectOwner');
    } else if (filter.includes('myInterests')) {
      events = await Project.find({ projectCategory: { $in: interests }, projectStatus: 'Accepted' }).populate('projectOwner');
    } else if (filter.includes('Free')) {
      events = await Project.find({ projectStatus: 'Accepted', projectPrice: 0 }).populate('projectOwner');
    } else if (filter.includes('Paid')) {
      events = await Project.find({ projectStatus: 'Accepted', projectPrice: { $gt: 0 } }).populate('projectOwner');
    } else if (filter.includes('Recent')) {
      events = await Project.find({ projectStatus: 'Accepted' }).sort({ createdAt: -1 }).populate('projectOwner');
    }
    
    res.render("user/dash", { title: "DashBoard", path: req.path, events: events, userData: req.userData, filter: filter });
  } catch (error) {
    res.send(error.message);
  }
};


const filterEvents = async (req, res) => {
  try {
    let { filter ,SearchInput } = req.body;
    req.session.filter = filter; // Save the filter option in the session
    let events = null;
    let interests = req.userData.userInterests;
    console.log(filter);
    if (!Array.isArray(filter)) {
      filter = [filter]; // Convert to array if only one option is selected
    }

    if (SearchInput) {
      events = await Project.find({ projectStatus: 'Accepted', projectName: { $regex: SearchInput, $options: 'i' } }).populate('projectOwner');
    } else
    {

    if (filter.includes('all')) {
      events = await Project.find({ projectStatus: 'Accepted' }).populate('projectOwner');
    } else if (filter.includes('myInterests')) {
      events = await Project.find({ projectCategory: { $in: interests }, projectStatus: 'Accepted' }).populate('projectOwner');
    } else if (filter.includes('Free')) {
      events = await Project.find({ projectStatus: 'Accepted', projectPrice: 0 }).populate('projectOwner');
    } else if (filter.includes('Paid')) {
      events = await Project.find({ projectStatus: 'Accepted', projectPrice: { $gt: 0 } }).populate('projectOwner');
    } else if (filter.includes('Recent')) {
      events = await Project.find({ projectStatus: 'Accepted' }).sort({ createdAt: -1 }).populate('projectOwner');
    }
  }

    console.log(events);
    res.render("user/dash", { title: "DashBoard", path: req.path, events: events, userData: req.userData, filter: filter });
  } catch (error) {
    res.send(error.message);
  }
}


// =========================END DashBoard ========================= //




//  ==================  Billing ==================  //


const billing_get = async (req, res) => {
  try {
    res.render("user/billing", { title: "Billing", path: req.path, userData: req.userData });
  } catch (error) {
    res.send(error.message);
  }
}


const billing_post = async (req, res) => {
  try {
    const { amount } = req.body;

    const userId = req.userData._id;
    const user = await User.findOneAndUpdate({ _id: userId }, { $inc: { balance: amount } });


    res.redirect("/user/billing");
  } catch (error) {
    res.send(error.message);
  }
}



//  ================== END  Billing ==================  //





// ========================= Profile ========================= //

const profile_get = async (req, res) => {
  try {

    const projectsApplied = await User.findOne({ _id: req.userData._id }).populate('userAppliedProjects._id');
    console.log(projectsApplied.userAppliedProjects);
    res.render("user/profile", { title: "Profile", path: req.path, userData: req.userData, projectsApplied: projectsApplied.userAppliedProjects });
  } catch (error) {
    res.send(error.message);
  }
};




const updateProfile = async (req, res) => {
  try {

    const {
      BGURL,
      LogoURL,
      userName,
      UserBio,
      Email,
      Location,
      interests,
      userGender,

    } = req.body;
    const userId = req.userData._id;


    let country = null
    let city = null

    if (Location != undefined) {


      let [countrySplited, citySplited, ...rest] = Location.split(',').map((item) => item.trim());

      extraInfo = rest.length > 0 ? `, ${rest.join(', ')}` : '';

      country = countrySplited;
      city = citySplited
    }

    const user = await User.updateOne({ _id: userId },
      {
        userName: userName || req.userData.userName,
        userBio: UserBio || req.userData.UserBio,
        userEmail: Email || req.userData.Email,
        userGender: userGender || req.userData.userGender,
        userLocation: {
          street: req.userData.userLocation.street,
          
          Apartment: req.userData.userLocation.Apartment,

          city: city || req.userData.userLocation.city,

          country: country || req.userData.userLocation.country,
        },
        userInterests: interests || req.userData.userInterests,
        coverPhoto: BGURL || req.userData.coverPhoto,
        profilePicture: LogoURL || req.userData.profilePicture,
      });


    res.redirect("/user/profile");
  } catch (error) {
    res.send(error.message);
  }
}

// ========================= END  Profile ========================= //


// ========================= Proejct View ========================= //
const projectView_get = async (req, res) => {
  try {
  
    const projectId = req.params.projectId;
    const project = await Project
      .findOne({ _id: projectId })
      .populate('projectOwner')
      .populate({
        path: 'projectParticipants',
        model: 'User',
        match: { _id: req.userData._id },
        select: 'userName userAppliedProjects'
      });

    let projectStatusWithUser = null;
    if (project.projectParticipants[0] && project.projectParticipants[0]['userAppliedProjects']) {
      projectStatusWithUser = project.projectParticipants[0]['userAppliedProjects'].find(i => i._id.toString() == projectId.toString());
    }

    res.render("user/projectView", { title: "Project View", path: req.path, project: project, userData: req.userData, projectStatusWithUser: projectStatusWithUser });
  }
  catch (error) {
    res.send(error.message);
  }
}


const ApplyForProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userData._id;

    
    try {

      const project = await Project.findByIdAndUpdate({ _id: projectId }, { $addToSet: { projectParticipants: userId } }).populate({
        path: 'projectOwner',
        select: 'companyName '
      });

      if (project.projectPaymentStatus==='Paid') {

        if (req.userData.balance < project.projectPrice) {
          return res.redirect('/user/projectView/' + projectId+'?error=balanceError'); 
        }

        await User.updateOne({ _id: userId }, {
          $push: {
          userAppliedProjects: { _id: projectId, status: 'pending', dateOfApplay: new Date() }  , 
          transactions: {projectName: project.projectName,projectOwner : project['projectOwner']['companyName'],projectPrice : project.projectPrice,dateOfTransaction: new Date() }
        },
          $inc: { balance: -(project.projectPrice) },
          
          
        }).then(async() => {
         await Company.updateOne({ _id: project.projectOwner._id }, {
            $push: {
              transactions: { 
                projectName : project.projectName,
                userEmail : req.userData.userEmail,
                projectPrice : project.projectPrice,
                feesAmount :(project.projectPrice*0.10),
                dateOfTransaction : new Date(),
               } 
            }
            ,
            $inc: { balance: (project.projectPrice - (project.projectPrice * 0.10)) }
          }).then(async() => {

           await Admin.findOneAndUpdate({role: 'admin'}, {
              $push: {
                transactions: { 
                  companyName : project.projectOwner.companyName,
                  userEmail : req.userData.userEmail,
                  feesAmount :(project.projectPrice*0.10),
                  dateOfTransaction : new Date(),
                 } 
              }
              ,
              $inc: { balance:(project.projectPrice*0.10)}
            })
          
          })
    

        }).catch((error) => { 
          console.log(error);
        });
      }else if(project.projectPaymentStatus==='Fees') {

        if (req.userData.balance < project.projectPrice) {
          return res.redirect('/user/projectView/' + projectId+'?error=balanceError'); 
        }

        await User.updateOne({ _id: userId }, {
          $push: {
          userAppliedProjects: { _id: projectId, status: 'pending', dateOfApplay: new Date() }  , 
          transactions: {projectName: project.projectName,projectOwner : project['projectOwner']['companyName'],projectPrice : project.projectPrice,dateOfTransaction: new Date() } },
          $inc: { balance: -(project.projectPrice) },
          
        }).then(async() => {
          await Admin.findOneAndUpdate({role: 'admin'}, {
             $push: {
               transactions: { 
                 companyName : project.projectOwner.companyName,
                 userEmail : req.userData.userEmail,
                 feesAmount :(project.projectPrice),
                 dateOfTransaction : new Date(),
                } 
             }
             ,
             $inc: { balance:(project.projectPrice)}
           })
        })

      }else {
        await User.updateOne({ _id: userId }, {
          $push: {
          userAppliedProjects: { _id: projectId, status: 'pending', dateOfApplay: new Date() }  
           }
          
        })
      }

    




      return res.redirect('/user/projectView/' + projectId+'?resp=balanceSuccess'); 
    } catch (error) {
      console.error('Error applying to project:', error);
      res.status(500).send('Failed to apply to project');
    }

  } catch (error) {
    res.send(error.message);
  }
}


const CancelApplay = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.userData._id;

    const project = await Project.findById(projectId).populate({
      path: 'projectOwner',
      select: 'companyName '
    });

    if (!project) {
      return res.status(404).send('Project not found');
    }
    
    // Remove the user from the project's participants
    await Project.findByIdAndUpdate(projectId, {
      $pull: { projectParticipants: userId }
    });

    // Find the user's application for the project
    const application = await User.findOne({ _id: userId, 'userAppliedProjects._id': projectId });

    // If the user has applied for the project, proceed with cancellation
    if (application) {
      // Remove the project from the user's applied projects
      await User.findByIdAndUpdate(userId, {
        $pull: { userAppliedProjects: { _id: projectId } }
      });

      // Reverse any balance changes and transaction records
      const transaction = application.transactions.find(t => t.projectName === project.projectName);

      if (project.projectPaymentStatus=="Paid") {
      
        if (transaction) {
          // Reverse the user's balance and remove the transaction
          await User.findByIdAndUpdate(userId, {
            $pull: { transactions: { projectName: project.projectName } },
            $inc: { balance: transaction.projectPrice }
          });

          // Reverse the company's balance and remove the transaction
          await Company.findOneAndUpdate({ _id: project.projectOwner }, {
            $pull: { transactions: { projectName: project.projectName } },
            $inc: { balance: -(project.projectPrice - (project.projectPrice * 0.10)) }
          });

          // Reverse the admin's balance and remove the transaction
          await Admin.findOneAndUpdate({ role: 'admin' }, {
            $pull: { transactions: { companyName: project.projectOwner.companyName } },
            $inc: { balance: -(project.projectPrice * 0.10)}
          });
        }


      }else if(project.projectPaymentStatus=="Fees"){
        if (transaction) {
          // Reverse the user's balance and remove the transaction
          await User.findByIdAndUpdate(userId, {
            $pull: { transactions: { projectName: project.projectName } },
            $inc: { balance: transaction.projectPrice }
          });


          // Reverse the admin's balance and remove the transaction
          await Admin.findOneAndUpdate({ role: 'admin' }, {
            $pull: { transactions: { companyName: project.projectOwner.companyName } },
            $inc: { balance: -(project.projectPrice)}
          });
        }
      }
    }

    res.redirect('/user/projectView/' + projectId);
  } catch (error) {
    console.error('Error cancelling application:', error);
    res.status(500).send('Failed to cancel application');
  }
}



// ========================= END Proejct View  ========================= //


// ========================= Company profile ========================= //

const companyProfile_get = async (req, res) => {
  try {

    
    const companyId = req.params.companyId;
    const company = await Company.findById(companyId);

    const projects = await Project.find({ projectOwner: companyId, projectStatus: 'Accepted'});
   

    res.render("user/companyProfile", { title: "Company Profile", path: req.path, orgData: company ,projects : projects });
  } catch (error) {
    res.send(error.message);
  }
}
// ========================= EndCompany profile ========================= //





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


  filterEvents,

  updateProfile,

  projectView_get,
  ApplyForProject,
  CancelApplay,

  companyProfile_get,

  logOut,
};
