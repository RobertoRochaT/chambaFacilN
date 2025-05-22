// src/pages/FreelancerDashboard.jsx
import { useContext, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const FreelancerDashboard = () => {
  const navigate = useNavigate()
  const { freelancerData, setFreelancerData, setFreelancerToken } =
    useContext(AppContext)

  const logout = () => {
    setFreelancerToken(null)
    localStorage.removeItem('freelancerToken')
    setFreelancerData(null)
    navigate('/')
  }

  useEffect(() => {
    if (freelancerData) {
      navigate('/freelancer/dashboard')
    }
  }, [freelancerData])

// Update the handleChatNavigation function

const handleChatNavigation = () => {
  if (freelancerData && freelancerData._id) {
    console.log("Navigating to chat with ID:", freelancerData._id);
    
    // Use the full API path with /api/ prefix
    const chatUrl = `${import.meta.env.VITE_CHAT_URL}/chat?freelancerId=${freelancerData._id}`;
    window.location.href = chatUrl;
  } else {
    console.error("Freelancer data or ID is missing");
  }
}


  return (
    <div className='min-h-screen'>
      {/* Top bar */}
      <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
          <img
            onClick={() => navigate('/')}
            className='max-sm:w-32 cursor-pointer'
            src={assets.logo}
            alt='logo'
          />

          {freelancerData && (
            <div className='flex items-center gap-4'>
              <button
                onClick={handleChatNavigation}
                className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600'
              >
                Chat
              </button>
              <p className='max-sm:hidden'>Hola, {freelancerData.name}</p>
              <div className='relative group'>
                <img
                  className='w-8 h-8 border rounded-full'
                  src={freelancerData.image}
                  alt='avatar'
                />
                <div className='absolute hidden group-hover:block top-0 right-0 z-10 bg-white rounded pt-12'>
                  <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                    <li
                      onClick={logout}
                      className='py-1 px-2 cursor-pointer pr-10 hover:bg-gray-100'
                    >
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex items-start'>
        {/* Sidebar */}
        <div className='inline-block min-h-screen border-r-2'>
          <ul className='flex flex-col items-start pt-5 text-gray-800'>
            <NavLink
              to='/freelancer/dashboard/chat'
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
                }`
              }
              onClick={(e) => {
                e.preventDefault();
                handleChatNavigation();
              }}
            >
              <img className='min-w-4' src={assets.chat_icon} alt='chat' />
              <p className='max-sm:hidden'>Chat</p>
            </NavLink>

            <NavLink
              to='/freelancer/dashboard/post-jobs'
              className={({ isActive }) =>
                `flex items-center p-3 sm:px-6 gap-2 w-full hover:bg-gray-100 ${
                  isActive ? 'bg-blue-100 border-r-4 border-blue-500' : ''
                }`
              }
            >
              <img className='min-w-4' src={assets.add_icon} alt='post' />
              <p className='max-sm:hidden'>Postear Trabajo</p>
            </NavLink>
          </ul>
        </div>

        {/* Main content */}
        <div className='flex-1 h-full p-2 sm:p-5'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default FreelancerDashboard