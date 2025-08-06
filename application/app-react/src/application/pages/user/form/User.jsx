//Core
import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { resizerContext } from "@/providers/iframe-resizer"
//Stores and services
import sessionStore from '@/stores/session'
import { UserService } from "@/services/userService"
//Componentes
import BreadCrumbs from "@/components/shared/BreadCrumbs"
import { InputText } from "primereact/inputtext"
import { FloatLabel } from "primereact/floatlabel"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Password } from "primereact/password"
import { Dropdown } from "primereact/dropdown"
import { FileUpload } from "primereact/fileupload"
import { InputNumber } from "primereact/inputnumber"



const roles = ['developer', 'client', 'admin', 'arquitect', 'pm']

export function User() {
  const { userId } = useParams()
  const userLogged = sessionStore.getState().user || {}
  const navigate = useNavigate()
  const userService = new UserService()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    idSlack: '',
    idClient: null,
    image: null,
    imagePreview: null,
    image_base: '',
    photo: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isNewUser = () => userId === 'NEW';

  useEffect(() => {
    if (isNewUser()) return;
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      const userData = await userService.getUser(userId)
      
      const imagePreview = userData.photo || null
      
      setForm(prev => ({
        ...prev,
        ...userData,
        imagePreview: imagePreview,
        image_base: userData.image_base || '',
        photo: import.meta.env.VITE_BASE_PHOTO + userData.photo || ''
      }))
    } catch (err) {
      setError('Error loading user data')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (event) => {
    const file = event.files[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = () => {
      const base64Data = reader.result;
      setForm(prev => ({
        ...prev,
        image: file,
        imagePreview: base64Data,
        image_base: base64Data
      }));
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.name) return setError('Name is required')
    if (!form.email) return setError('Email is required')
    if (!form.password && isNewUser) return setError('Password is required')
    if (!form.role) return setError('Role is required')
    if(form.password.length < 8) return setError('Password must be at least 8 characters long')
    // e.preventDefault()
    setSubmitted(true)
    setLoading(true)
    setError('')

    try {
      const formData = {
        ...form,
        id: userId,
        // Remove the actual file object since we're sending base64
        image: undefined
      }

      if (isNewUser()) {
        await userService.createUser(formData)
      } else {
        await userService.updateUser(userId, formData)
      }
      
      setSubmitted(false)
      setLoading(false)
      navigate(-1)
    } catch (error) {
      setError(error.message || 'Error saving user data')
      setSubmitted(false)
      setLoading(false)
    }
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-medium">{isNewUser() ? 'Creating User' : 'Editing User'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col">
            <FloatLabel className="w-full">
              <InputText 
                id="name" 
                name="name"
                value={form.name} 
                onChange={handleChange} 
                required
                className="p-inputtext-sm w-full"
              />
              <label htmlFor="name">Name *</label>
            </FloatLabel>
          </div>
          <div className="col">
            <FloatLabel className="w-full">
              <InputText 
                id="email" 
                name="email"
                value={form.email} 
                onChange={handleChange} 
                required
                className="p-inputtext-sm w-full"
                inputstyle={{ width: '100%' }}
              />
              <label htmlFor="email">Email *</label>
            </FloatLabel>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col">
            <FloatLabel className="w-full">
              <Password 
                id="password" 
                name="password"
                value={form.password} 
                onChange={handleChange} 
                className="p-inputtext-sm w-full"
                inputClassName="w-full"
              />
              <label htmlFor="password">Password</label>
            </FloatLabel>
          </div>
          <div className="col">
            <FloatLabel className="w-full">
              <Dropdown 
                id="role" 
                name="role"
                value={form.role} 
                options={roles}
                onChange={(e) => handleChange({ target: { name: 'role', value: e.value } })}
                disabled={userLogged.userRole !== 'admin'}
                className="p-inputtext-sm w-full"
                inputstyle={{ width: '100%' }}
              />
              <label htmlFor="role">Role</label>
            </FloatLabel>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col">
            <FloatLabel className="w-full">
              <InputText 
                id="slackId" 
                name="idSlack"
                value={form.idSlack} 
                onChange={handleChange} 
                className="p-inputtext-sm w-full"
                inputstyle={{ width: '100%' }}
              />
              <label htmlFor="slackId">Slack ID</label>
            </FloatLabel>
          </div>
          <div className="col">
            <div className="flex flex-col gap-2">
              Imagen actual:
              <img
                src={form.photo}
                alt="Profile"
                className="w-40 h-40 object-cover rounded-full mb-2"
              />
              <FileUpload 
                mode="basic"
                name="image" 
                onSelect={handleFileSelect}
                accept="image/*"
                maxFileSize={1000000}
                className="w-full"
              />
              {form.imagePreview && (
                <img 
                  src={form.imagePreview} 
                  alt="Profile preview" 
                  className="w-40 h-40 object-cover rounded-full mb-2"
                />
              )}
            </div>
          </div>
        </div>

        {form.role === 'client' && (
          <div className="col">
            <FloatLabel className="w-full">
              <InputNumber 
                id="clientId" 
                name="idClient"
                value={form.idClient} 
                onChange={(e) => setForm((prev) => ({ ...prev, idClient: e.value }))}
                className="p-inputtext-sm w-full"
                inputstyle={{ width: '100%' }}
              />
              <label htmlFor="clientId">Client ID</label>
            </FloatLabel>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-right  ml-auto animate-bounce">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button 
            label="Back" 
            icon="pi pi-arrow-left"
            size="small"
            className="p-button-text"
            onClick={() => navigate(-1)}
          />
          <Button 
            type="submit" 
            label={loading ? "Saving..." : isNewUser() ? "Save" : "Update"} 
            size="small"
            disabled={submitted || loading}
          />
        </div>
      </form>
    </div>
  )
}
