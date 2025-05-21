import { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import FreelancerDashboard from './pages/FreelancerDashboard.jsx'
import PostFreelancer from './pages/PostFreelancer.jsx'
import FreelancerJobDetail from './pages/FreelancerJobDetail.jsx'
// import FreelancerChat from './pages/FreelancerChat'
import 'quill/dist/quill.snow.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatApp from './pages/ChatApp'
// :O Just a comment to make sure the code is working
const App = () => {
  const { showRecruiterLogin, companyToken, freelancerToken } = useContext(AppContext)

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/apply-job/:id' element={<ApplyJob />} />
        <Route path='/applications' element={<Applications />} />
        <Route path='/freelancer/jobs/:id' element={<FreelancerJobDetail/>} />
        <Route path="/chat" element={<ChatApp />} />
        {/* Company dashboard */}
        <Route path='/dashboard' element={<Dashboard />}>
          {companyToken && (
            <>
              <Route path='add-job' element={<AddJob />} />
              <Route path='manage-jobs' element={<ManageJobs />} />
              <Route path='view-applications' element={<ViewApplications />} />
            </>
          )}
        </Route>

        {/* Freelancer dashboard */}
        <Route path='/freelancer/dashboard' element={<FreelancerDashboard />}>
          {freelancerToken && (
            <>
              <Route path='post-jobs' element={<PostFreelancer />} />
            </>
          )}
        </Route>
      </Routes>
    </div>
  )
}

export default App
