import { useContext, useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { resizerContext } from "@/providers/iframe-resizer"
import BreadCrumbs from "@/components/shared/BreadCrumbs"
import { InputText } from "primereact/inputtext"
import { FloatLabel } from "primereact/floatlabel"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { Password } from "primereact/password"
import { Dropdown } from "primereact/dropdown"
import { FileUpload } from "primereact/fileupload"
import { InputNumber } from "primereact/inputnumber"
import { UserService } from "@/services/userService"

const roles = ['developer', 'client', 'admin', 'arquitect', 'pm']

export function User() {
  const { userId } = useParams()
  const { user, token } = useContext(resizerContext)
  const navigate = useNavigate()
  const userService = new UserService()
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    idSlack: '',
    idClient: null,
    image: null
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const loadUserData = async () => {
    try {
      const userData = await userService.getUser(userId)
      setForm(prev => ({
        ...prev,
        ...userData
      }))
    } catch (err) {
      setError('Error loading user data')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (e) => {
    try {
      setForm((prev) => ({ ...prev, image: e.files[0] }))
      if (userId) {
        await userService.uploadProfileImage(userId, e.files[0])
      }
    } catch (error) {
      setError('Error uploading image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setLoading(true)
    setError('')

    try {
      const formData = {
        ...form,
        id: userId,
      }

      if (userId) {
        await userService.updateUser(userId, formData)
      } else {
        await userService.createUser(formData)
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
        <h2 className="text-2xl font-medium">{userId ? 'Editing User' : 'Creating User'}</h2>
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
                className="w-full"
                style={{ height: '36px' }}
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
                className="w-full"
                style={{ height: '36px' }}
                inputStyle={{ width: '100%' }}
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
                className="w-full"
                style={{ height: '36px' }}
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
                className="w-full"
                style={{ height: '36px' }}
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
                className="w-full"
                style={{ height: '36px' }}
              />
              <label htmlFor="slackId">Slack ID</label>
            </FloatLabel>
          </div>
          <div className="col">
            <FloatLabel className="w-full">
              <FileUpload 
                name="image" 
                customUpload
                chooseLabel="Select image"
                onUpload={handleFileUpload}
                accept="image/*"
                className="w-full"
              />
              <label htmlFor="image">Profile Image</label>
            </FloatLabel>
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
                className="w-full"
                style={{ height: '36px' }}
              />
              <label htmlFor="clientId">Client ID</label>
            </FloatLabel>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <Button 
            label="Back" 
            icon="pi pi-arrow-left"
            className="p-button-text"
            onClick={() => navigate(-1)}
          />
          <Button 
            type="submit" 
            label={loading ? "Saving..." : userId ? "Update" : "Save"} 
            className=""
            disabled={submitted || loading}
            style={{ height: '36px' }}
          />
        </div>
      </form>
    </div>
  )
}
