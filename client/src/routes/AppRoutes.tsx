import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { Home } from '../pages/Home'
import { Login } from '../pages/Login'
import { Signup } from '../pages/Signup'
import { ProtectedRoute } from '../utils/ProtectedRoute.tsx'
export const AppRoutes = ()=> {
  return (
    <BrowserRouter>
        <Routes>
        <Route path='/' element={<ProtectedRoute component={Home}/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        </Routes>
    </BrowserRouter>
  )
}
