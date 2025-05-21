import { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const RecruiterLogin = () => {
  const navigate = useNavigate()
  const {
    setShowRecruiterLogin,
    backendUrl,
    setCompanyToken,
    setCompanyData,
    setFreelancerToken,
    setFreelancerData,
  } = useContext(AppContext)

  // tipo de usuario: 'empresa' o 'freelancer'
  const [userType, setUserType] = useState('empresa')
  // estado auth: 'Login' o 'SignUp'
  const [authState, setAuthState] = useState('Login')
  // paso de SignUp: 'text' o 'image'
  const [stage, setStage] = useState('text')
  const [isTextSubmitted, setIsTextSubmitted] = useState(false)

  // campos comunes
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // empresa
  const [companyName, setCompanyName] = useState('')
  const [companyImage, setCompanyImage] = useState(null)

  // freelancer
  const [freelancerName, setFreelancerName] = useState('')
  const [freelancerImage, setFreelancerImage] = useState(null)

  const onSubmitHandler = async e => {
    e.preventDefault()

    try {
      if (userType === 'empresa') {
        if (authState === 'Login') {
          const { data } = await axios.post(
            `${backendUrl}/api/company/login`,
            { email, password }
          )
          if (data.success) {
            setCompanyData(data.company)
            setCompanyToken(data.token)
            localStorage.setItem('companyToken', data.token)
            setShowRecruiterLogin(false)
            navigate('/dashboard')
          } else {
            toast.error(data.message)
          }
        } else {
          // SignUp empresa
          if (stage === 'text' && !isTextSubmitted) {
            setIsTextSubmitted(true)
            setStage('image')
            return
          }
          const formData = new FormData()
          formData.append('name', companyName)
          formData.append('email', email)
          formData.append('password', password)
          if (companyImage) formData.append('image', companyImage)

          const { data } = await axios.post(
            `${backendUrl}/api/company/register`,
            formData
          )
          if (data.success) {
            setCompanyData(data.company)
            setCompanyToken(data.token)
            localStorage.setItem('companyToken', data.token)
            setShowRecruiterLogin(false)
            navigate('/dashboard')
          } else {
            toast.error(data.message)
          }
        }
      } else {
        // freelancer
        if (authState === 'Login') {
          const { data } = await axios.post(
            `${backendUrl}/api/freelancers/login`,
            { email, password }
          )
          if (data.success) {
            setFreelancerData(data.freelancer)
            setFreelancerToken(data.token)
            localStorage.setItem('freelancerToken', data.token)
            setShowRecruiterLogin(false)
            navigate('/freelancer/dashboard')
          } else {
            toast.error(data.message)
          }
        } else {
          // SignUp freelancer
          if (stage === 'text' && !isTextSubmitted) {
            setIsTextSubmitted(true)
            setStage('image')
            return
          }
          const payload = new FormData()
          payload.append('name', freelancerName)
          payload.append('email', email)
          payload.append('password', password)
          if (freelancerImage) payload.append('image', freelancerImage)

          const { data } = await axios.post(
            `${backendUrl}/api/freelancers/register`,
            payload
          )
          if (data.success) {
            setFreelancerData(data.freelancer)
            setFreelancerToken(data.token)
            localStorage.setItem('freelancerToken', data.token)
            setShowRecruiterLogin(false)
            navigate('/freelancer/dashboard')
          } else {
            toast.error(data.message)
          }
        }
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <form
        onSubmit={onSubmitHandler}
        className="relative bg-white p-8 rounded-xl text-gray-700 w-full max-w-sm"
      >
        {/* selector Empresa / Freelancer */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => {
              setUserType('empresa')
              setAuthState('Login')
              setStage('text')
              setIsTextSubmitted(false)
            }}
            className={`flex-1 py-2 rounded-l-full ${
              userType === 'empresa'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Empresa
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType('freelancer')
              setAuthState('Login')
              setStage('text')
              setIsTextSubmitted(false)
            }}
            className={`flex-1 py-2 rounded-r-full ${
              userType === 'freelancer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Freelancer
          </button>
        </div>

        <h1 className="text-center text-2xl font-semibold mb-4">
          {userType === 'empresa'
            ? `Empresa ${authState}`
            : `Freelancer ${authState}`}
        </h1>

        {/* formulario */}
        {userType === 'empresa' && authState === 'SignUp' && stage === 'image' ? (
          <div className="flex items-center gap-4 my-6">
            <label htmlFor="companyImage">
              <img
                className="w-16 h-16 rounded-full"
                src={companyImage ? URL.createObjectURL(companyImage) : assets.upload_area}
                alt="logo"
              />
              <input
                id="companyImage"
                type="file"
                hidden
                onChange={e => setCompanyImage(e.target.files[0])}
              />
            </label>
            <p>Sube logo de la empresa</p>
          </div>
        ) : userType === 'freelancer' && authState === 'SignUp' && stage === 'image' ? (
          <div className="flex items-center gap-4 my-6">
            <label htmlFor="freelancerImage">
              <img
                className="w-16 h-16 rounded-full"
                src={freelancerImage ? URL.createObjectURL(freelancerImage) : assets.upload_area}
                alt="avatar"
              />
              <input
                id="freelancerImage"
                type="file"
                hidden
                onChange={e => setFreelancerImage(e.target.files[0])}
              />
            </label>
            <p>Sube avatar de freelancer</p>
          </div>
        ) : (
          <>
            {authState === 'SignUp' && stage === 'text' && (
              <input
                className="border px-4 py-2 rounded-full w-full mb-4"
                placeholder={userType === 'empresa' ? 'Nombre de empresa' : 'Nombre completo'}
                value={userType === 'empresa' ? companyName : freelancerName}
                onChange={e =>
                  userType === 'empresa'
                    ? setCompanyName(e.target.value)
                    : setFreelancerName(e.target.value)
                }
                required
              />
            )}
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mb-4">
              <img src={assets.email_icon} alt="" />
              <input
                className="outline-none w-full"
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="border px-4 py-2 flex items-center gap-2 rounded-full mb-6">
              <img src={assets.lock_icon} alt="" />
              <input
                className="outline-none w-full"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-600 w-full text-white py-2 rounded-full mb-4"
        >
          {authState === 'Login'
            ? 'Login'
            : stage === 'text'
            ? 'Siguiente'
            : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm">
          {authState === 'Login'
            ? '¿No tienes cuenta? '
            : '¿Ya tienes cuenta? '}
          <span
            onClick={() => {
              setAuthState(authState === 'Login' ? 'SignUp' : 'Login')
              setStage('text')
              setIsTextSubmitted(false)
            }}
            className="text-blue-600 cursor-pointer"
          >
            {authState === 'Login' ? 'Regístrate' : 'Login'}
          </span>
        </p>

        <img
          onClick={() => setShowRecruiterLogin(false)}
          className="absolute top-4 right-4 w-6 h-6 cursor-pointer"
          src={assets.cross_icon}
          alt="close"
        />
      </form>
    </div>
  )
}

export default RecruiterLogin
