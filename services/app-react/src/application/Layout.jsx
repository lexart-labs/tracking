import { Outlet } from "react-router-dom"
import { PrimeReactContext } from "primereact/api"
import { useContext } from "react"
import { Card } from "primereact/card"

export default function Layout() {
  const { changeTheme } = useContext(PrimeReactContext)


  return (
    <div className="lexart-flex">
      <div className="lexart-wa w-full">
        <Outlet />
      </div>
    </div>
  )
}
