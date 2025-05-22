// src/pages/FreelancerJobDetail.jsx
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loading from '../components/Loading';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const FreelancerJobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl, userData } = useContext(AppContext);
  const { getToken } = useAuth();

  const [job, setJob] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [otherWorks, setOtherWorks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch job details + ratings
  // src/pages/FreelancerJobDetail.jsx
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/freelancers/${id}`
        );
        if (!data.success) throw new Error(data.message);
        const job = data.job;
        setJob(job);

        const f = job.freelancerId;
        // now guaranteed arrays/defaults by controller
        setAvgRating(f.averageRating);

        if (userData?._id) {
          // ratings is never undefined
          const mine = f.ratings.find(r => r.user === userData._id);
          setMyRating(mine?.rating || 0);
        }
      } catch (err) {
        toast.error(err.message || 'Error loading details');
      } finally {
        setLoading(false);
      }
    })();
  }, [backendUrl, id, userData]);


  // Fetch other works by same freelancer
  useEffect(() => {
    if (!job) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/freelancers/jobs/list`
        );
        if (data.success) {
          setOtherWorks(
            data.jobs.filter(
              w =>
                w.freelancerId?._id === job.freelancerId._id &&
                w._id !== job._id
            )
          );
        }
      } catch {}
    })();
  }, [backendUrl, job]);

  // Submit 1–5 star rating
  const submitRating = async stars => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/freelancers/${job.freelancerId._id}/rate`,
        { rating: stars },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!data.success) throw new Error(data.message);
      setAvgRating(data.averageRating);
      setMyRating(stars);
      toast.success('Thanks for your feedback!');
    } catch (err) {
      toast.error(err.message || 'Could not submit rating');
    }
  };

  if (loading) return <Loading />;
  if (!job) return <div className="p-8">Not found</div>;

  const prev = () =>
    setCurrentIndex(i => (i === 0 ? job.images.length - 1 : i - 1));
  const next = () =>
    setCurrentIndex(i =>
      i === job.images.length - 1 ? 0 : i + 1
    );

  console.log('USer ' + userData?._id);
  //                   window.location.href = `http://localhost:5174/chat?userId=${userData._id}&targetId=${job.freelancerId._id}&chatId=${chatData.data._id}`;

  console.log('Chat data:', job.freelancerId);
  console.log('Chat data:', job.freelancerId._id);
  
  return (
    <>
      <Navbar />
      <div className="min-h-screen container mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">
        {/* Main Column */}
        <div className="lg:w-2/3 flex flex-col gap-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={job.freelancerId.image}
                alt={job.freelancerId.name}
                className="w-24 h-24 rounded-full border p-1 mr-6"
              />
              <div>
                <h1 className="text-3xl font-semibold">{job.title}</h1>
                <p className="text-gray-600 mt-1">{job.freelancerId.name}</p>
                <div className="flex items-center gap-6 text-gray-500 mt-2">
                  <span>{job.category}</span>
                  <span>{job.location}</span>
                  <span>€{job.rate}/h</span>
                  {/* ⭐ YOUR RATING APPEARS NEXT TO PRICE */}
                <span className="flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n}
                      onClick={() => submitRating(n)}
                      className={`text-xl ${
                        n <= (myRating || avgRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </span>
                <span className="text-gray-600 ml-2">
                  {avgRating.toFixed(1)} / 5
                </span>
                </div>
              </div>
            </div>
            <button
              onClick={async () => {
                if (!userData) {
                  toast.error("Por favor inicia sesión para contactar al freelancer");
                  return;
                }
                
                try {
                  // Mostrar estado de carga
                  toast.loading("Conectando con el freelancer...");
                  
                  // Ensure we have complete user data to send to chat system
                  const userDataForChat = {
                    externalId: userData._id,
                    firstName: userData.firstName || userData.name?.split(' ')[0] || 'Usuario',
                    lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
                    email: userData.email || `user_${userData.id}@example.com`,
                    password: "chat-temp-password-" + userData.id,
                    profileImage: userData.image || userData.profileImage,
                    name: userData.name || userData.firstName + ' ' + userData.lastName || 'Usuario'
                  };
                  
                  console.log("Sending user data to chat:", userDataForChat);
                  
                  // Step 1: First obtain a proper chat token using external signup
                  const chatAuthResponse = await fetch(`${import.meta.env.VITE_BACKEND_CHAT_URL}/api/auth/external-signup`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userDataForChat)
                  });
                  
                  const chatAuthData = await chatAuthResponse.json();
                  
                  if (!chatAuthData.token) {
                    throw new Error("No se pudo obtener autenticación para el chat");
                  }
                  
                  // Step 2: Use the chat token to create a conversation
                  const chatResponse = await fetch(`${import.meta.env.VITE_BACKEND_CHAT_URL}/api/chat`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${chatAuthData.token}`
                    },
                    body: JSON.stringify({ userId: job.freelancerId._id })
                  });
                  
                  if (!chatResponse.ok) {
                    throw new Error("Error al crear el chat");
                  }
                  
                  const chatData = await chatResponse.json();
                  
                  toast.dismiss();
                  toast.success("Chat creado correctamente");
                  
                  // Step 3: Redirect to chat with the chat ID
                  window.location.href = `${import.meta.env.VITE_CHAT_URL}chat?userId=${userData._id}&targetId=${job.freelancerId._id}&chatId=${chatData.data._id}`;
                  
                } catch (err) {
                  toast.dismiss();
                  console.error("Error al crear el chat:", err);
                  toast.error(err.message || "Error al crear el chat");
                }
              }}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Contactar ahora
            </button>
          </div>

          {/* Carousel */}
          <section className="bg-white p-6 rounded-lg shadow relative">
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
            >
              ‹
            </button>
            <img
              src={job.images[currentIndex]}
              alt={`work-${currentIndex}`}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow"
            >
              ›
            </button>
          </section>

          {/* Job Details */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Detalles del trabajo</h2>
            <div
              className="rich-text text-gray-700"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </section>
        </div>

        {/* Sidebar: Other works */}
        <aside className="lg:w-1/3">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">
              Other works from {job.freelancerId.name}
            </h2>
            {otherWorks.length === 0 ? (
              <p className="text-gray-600">No other works yet.</p>
            ) : (
              <ul className="space-y-4">
                {otherWorks.map(w => (
                  <li
                    key={w._id}
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => navigate(`/freelancer/jobs/${w._id}`)}
                  >
                    <img
                      src={w.images[0] || assets.profile_placeholder}
                      alt={w.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold">{w.title}</h3>
                      <p className="text-sm text-gray-500">€{w.rate}/h</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
};

export default FreelancerJobDetail;
