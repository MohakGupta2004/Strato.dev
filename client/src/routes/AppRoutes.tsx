import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Signup'
import { ProtectedRoute } from '../utils/ProtectedRoute.tsx'
import { Projects } from '../pages/Projects.tsx'
import Navbar from '../components/Navbar'
import Wallet from '../components/Wallet.tsx'
import ConnectWallet from '../pages/ConnectWallet.tsx'

export const AppRoutes = ()=> {
  return (
    <BrowserRouter>
      <Wallet>
        <Routes>
        <Route path='/' element={
          <>
            <ProtectedRoute component={Navbar}/>
            <ProtectedRoute component={Home}/>
          </>
        }></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/wallet' element={<ConnectWallet/>}></Route>
        <Route path='/projects' element={
          <>
            {/* <ProtectedRoute component={PushToGithub}/> */}
            <ProtectedRoute component={Projects}/>
          </>
        }></Route>
        </Routes>
        </Wallet>
    </BrowserRouter>
  )
}
