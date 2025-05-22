// src/components/Navbar.jsx
import { useContext } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const { openSignIn } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()
  const { setShowRecruiterLogin } = useContext(AppContext)

  const handleChatNavigation = () => {
    const userId = user?.id

    const chatUrl = `${import.meta.env.VITE_CHAT_URL}/chat?userId=${userId}`;
    window.location.href = chatUrl;
  }

  return (
    <div className='shadow py-4'>
      <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
        <img
          onClick={() => navigate('/')}
          className='cursor-pointer'
          src={assets.logo}
          alt='logo'
        />

        {user ? (
          <div className='flex items-center gap-4'>
            <Link to='/applications' className='hover:underline'>
              Applied Jobs
            </Link>
            <button
              onClick={handleChatNavigation}
              className='hover:underline'
              >
              Chat
            </button>
            <span className='text-gray-400'>|</span>
            <p className='max-sm:hidden'>
              Hi, {user.firstName} {user.lastName}
            </p>
            <UserButton />
          </div>
        ) : (
          <div className='flex gap-4 max-sm:text-xs'>
            <button
              onClick={() => setShowRecruiterLogin(true)}
              className='text-gray-600'
            >
              Recruiter Login
            </button>
            <button
              onClick={openSignIn}
              className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full'
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
