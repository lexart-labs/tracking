import { Outlet } from "react-router-dom"
import { PrimeReactContext } from "primereact/api"
import { useContext } from "react"
import { Card } from "primereact/card"

export default function Layout() {
  const { changeTheme } = useContext(PrimeReactContext)


  return (
    <Card>
      <div className="rounded">
        <Outlet />
      </div>
    </Card>
  )
}
