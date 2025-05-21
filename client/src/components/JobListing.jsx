import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { assets, JobCategories, JobLocations } from '../assets/assets'
import JobCard from './JobCard'
import { useNavigate } from 'react-router-dom'
const JobListing = () => {
  const {
    isSearched,
    searchFilter,
    setSearchFilter,
    jobs,
    backendUrl
  } = useContext(AppContext)

  const [showFilter, setShowFilter] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedLocations, setSelectedLocations] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [skilledJobs, setSkilledJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const navigate = useNavigate()
  const handleCategoryChange = category => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }
  const handleLocationChange = location => {
    setSelectedLocations(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    )
  }

  useEffect(() => {
    const matchesCategory = job =>
      selectedCategories.length === 0 || selectedCategories.includes(job.category)
    const matchesLocation = job =>
      selectedLocations.length === 0 || selectedLocations.includes(job.location)
    const matchesTitle = job =>
      !searchFilter.title ||
      job.title.toLowerCase().includes(searchFilter.title.toLowerCase())
    const matchesSearchLocation = job =>
      !searchFilter.location ||
      job.location.toLowerCase().includes(searchFilter.location.toLowerCase())

    const newFiltered = jobs
      .slice()
      .reverse()
      .filter(
        job =>
          matchesCategory(job) &&
          matchesLocation(job) &&
          matchesTitle(job) &&
          matchesSearchLocation(job)
      )

    setFilteredJobs(newFiltered)
    setCurrentPage(1)
  }, [jobs, selectedCategories, selectedLocations, searchFilter])

  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${backendUrl}/api/freelancers/jobs/list`)
        if (res.data.success) {
          setSkilledJobs(res.data.jobs)
          setError(null)
        } else {
          setError('No se pudieron cargar los freelancers')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchFreelancers()
  }, [backendUrl])

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8">
      {/* Sidebar Filters */}
      <div className="w-full lg:w-1/4 bg-white px-4">
        {isSearched && (searchFilter.title || searchFilter.location) && (
          <>
            <h3 className="font-medium text-lg mb-4">Current Search</h3>
            <div className="mb-4 text-gray-600">
              {searchFilter.title && (
                <span className="inline-flex items-center gap-2.5 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
                  {searchFilter.title}
                  <img
                    onClick={() =>
                      setSearchFilter(prev => ({ ...prev, title: '' }))
                    }
                    className="cursor-pointer"
                    src={assets.cross_icon}
                    alt=""
                  />
                </span>
              )}
              {searchFilter.location && (
                <span className="ml-2 inline-flex items-center gap-2.5 bg-red-50 border border-red-200 px-4 py-1.5 rounded">
                  {searchFilter.location}
                  <img
                    onClick={() =>
                      setSearchFilter(prev => ({ ...prev, location: '' }))
                    }
                    className="cursor-pointer"
                    src={assets.cross_icon}
                    alt=""
                  />
                </span>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => setShowFilter(prev => !prev)}
          className="px-6 py-1.5 rounded border border-gray-400 lg:hidden"
        >
          {showFilter ? 'Close' : 'Filters'}
        </button>

        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-medium text-lg py-4">Search by Categories</h4>
          <ul className="space-y-4 text-gray-600">
            {JobCategories.map((category, idx) => (
              <li className="flex gap-3 items-center" key={idx}>
                <input
                  type="checkbox"
                  className="scale-125"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className={showFilter ? '' : 'max-lg:hidden'}>
          <h4 className="font-medium text-lg py-4 pt-14">Search by Location</h4>
          <ul className="space-y-4 text-gray-600">
            {JobLocations.map((location, idx) => (
              <li className="flex gap-3 items-center" key={idx}>
                <input
                  type="checkbox"
                  className="scale-125"
                  checked={selectedLocations.includes(location)}
                  onChange={() => handleLocationChange(location)}
                />
                {location}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-3/4">
        {/* Company Jobs */}
        <section className="text-gray-800 max-lg:px-4 mb-12">
          <h3 id="job-list" className="font-medium text-3xl py-2">
            Latest jobs by companies
          </h3>
          <p className="mb-8">Get your desired job from top companies</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs
              .slice((currentPage - 1) * 6, currentPage * 6)
              .map((job, idx) => (
                <JobCard key={idx} job={job} />
              ))}
          </div>
          {/* Pagination (same as before) */}
        </section>

        {/* Freelancer Jobs */}
        <section className="text-gray-800 px-4 lg:px-6">
          <h3 className="font-medium text-3xl py-2">
            Skilled Trade Opportunities
          </h3>
          <p className="mb-8">
            Browse independent contractors and their services
          </p>

          {loading && <div className="py-8 text-center">Loading...</div>}
          {error && (
            <div className="py-8 text-center text-red-500">{error}</div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {skilledJobs.map((freelancer, idx) => (
                // Console.log('freelancer:', freelancer)

                
                <div
                  key={freelancer._id}
                  className="border rounded-lg p-4 flex flex-col text-gray-800"
                >
                  { /* FOTO CIRCULAR */ }
                  <img
                    src={freelancer.freelancerId.image || assets.profile_placeholder}
                    alt={freelancer.freelancerId.name}
                    className="w-12 h-12 rounded-full mb-3 object-cover"
                  />

                  {/* Mostrar trabajo (categoría) primero, luego nombre */}
                  <h4 className="text-xl font-semibold mb-1">
                    {freelancer.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {freelancer.freelancerId.name}
                  </p>

                  {/* Descripción (si existe) */}
                  {freelancer.description && (
                    <div
                      className="rich-text text-sm mb-4 flex-1"
                      dangerouslySetInnerHTML={{ __html: freelancer.description }}
                    />
                  )}

                  {/* Botones: Contactar (azul) + Leer más */}
                  <div className="mt-auto flex gap-2">
                  <button
                      onClick={() =>
                        navigate(`/freelancer/jobs/${freelancer._id}`)
                      }
                      className="bg-blue-600 text-white py-2 px-4 rounded"
                  >                     
                   Contactar
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/freelancer/jobs/${freelancer._id}`)
                      }
                      className="border border-blue-600 text-blue-600 py-2 px-4 rounded"
                    >                      
                    Leer más
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default JobListing
