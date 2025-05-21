// src/pages/PostFreelancer.jsx
import { useContext, useEffect, useRef, useState } from 'react'
import Quill from 'quill'
import { FreelancerCategories, FreelancerLocations } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const PostFreelancer = () => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(FreelancerCategories[0])
  const [location, setLocation] = useState(FreelancerLocations[0])
  const [rate, setRate] = useState(0)
  const [files, setFiles] = useState([])
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const fileInputRef = useRef(null)

  const { backendUrl, freelancerToken } = useContext(AppContext)

  const onSubmitHandler = async e => {
    e.preventDefault()
    try {
      const description = quillRef.current.root.innerHTML
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('location', location)
      formData.append('rate', rate)
      files.forEach(file => formData.append('images', file))

      const { data } = await axios.post(
        `${backendUrl}/api/freelancers/jobs/post-job`,
        formData,
        {
          headers: {
            token: freelancerToken,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      if (data.success) {
        toast.success(data.message)
        setTitle('')
        setRate(0)
        quillRef.current.root.innerHTML = ''
        setFiles([])
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
    }
  }, [])

  const handleDrop = e => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/')
    )
    setFiles(prev => [...prev, ...dropped])
  }

  const handleDragOver = e => {
    e.preventDefault()
  }

  const removeFile = index => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="container p-4 flex flex-col w-full items-start gap-4"
      encType="multipart/form-data"
    >
      <div className="w-full">
        <p className="mb-2 font-medium">Título del servicio</p>
        <input
          type="text"
          placeholder="e.j. Reparación de tuberías"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded"
        />
      </div>

      <div className="w-full max-w-lg">
        <p className="my-2 font-medium">Descripción</p>
        <div ref={editorRef} className="h-40 border border-gray-300 rounded" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="flex-1">
          <p className="mb-2 font-medium">Categoría</p>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded"
          >
            {FreelancerCategories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <p className="mb-2 font-medium">Ubicación</p>
          <select
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded"
          >
            {FreelancerLocations.map((l, i) => (
              <option key={i} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <p className="mb-2 font-medium">Tarifa (€/hora)</p>
          <input
            type="number"
            min={0}
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="50"
            required
            className="w-full px-3 py-2 border-2 border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="w-full">
        <p className="mb-2 font-medium">
          Sube archivos (portafolio, fotos, documentos)
        </p>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition"
        >
          <p className="text-gray-500">
            Arrastra tus imágenes aquí o haz clic para seleccionar
          </p>
          <input
            ref={fileInputRef}
            type="file"
            name="images"
            multiple
            accept="image/*"
            className="hidden"
            onChange={e =>
              setFiles(prev => [...prev, ...Array.from(e.target.files)])
            }
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            {files.map((file, idx) => {
              const url = URL.createObjectURL(file)
              return (
                <div key={idx} className="relative w-full h-24">
                  <img
                    src={url}
                    alt={`preview-${idx}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button className="w-32 py-3 mt-4 bg-black text-white rounded">
        Publicar
      </button>
    </form>
  )
}

export default PostFreelancer
