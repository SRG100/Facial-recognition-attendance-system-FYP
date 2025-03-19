import React from 'react'
import SidebarComponent from '../components/SideBar'

const Modules = ({userRole}) => {
  return (
    <div>Modules
        <SidebarComponent userRole={userRole}/>
    </div>
  )
}

export default Modules