import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import RequireRole from './components/RequireRole'
import AdminLayout from './layouts/AdminLayout'
import StaffLayout from './layouts/StaffLayout'
import CustomerLayout from './layouts/CustomerLayout'
import Login from './login/Login'
import Register from './login/Register'
import ForgotPassword from './login/ForgotPassword'
import ResetPassword from './login/ResetPassword'
import VerifyOtp from './login/VerifyOtp'
import Home from './pages/Home'
import About from './pages/About'
import Service from './pages/Service'
import NowShowing from './pages/NowShowing'
import ComingSoon from './pages/ComingSoon'
import Cinemas from './pages/Cinemas'
import Promotion from './pages/Promotion'
import Profile from './pages/Profile'
import Booking from './pages/Booking'
import Watch from './pages/Watch'
import BookingList from './pages/admin/dashboard/bookings/BookingList'
import CategoriesList from './pages/admin/dashboard/categories/CategoriesList'
import CategoriesForm from './pages/admin/dashboard/categories/CategoriesForm'
import CinemaList from './pages/admin/dashboard/cinemas/CinemaList'
import CinemaForm from './pages/admin/dashboard/cinemas/CinemaForm'
import MovieList from './pages/admin/dashboard/movies/MovieList'
import MovieCreate from './pages/admin/dashboard/movies/MovieCreate'
import MovieEdit from './pages/admin/dashboard/movies/MovieEdit'
import RoomList from './pages/admin/dashboard/rooms/RoomList'
import RoomForm from './pages/admin/dashboard/rooms/RoomForm'
import SeatList from './pages/admin/dashboard/seats/SeatList'
import SeatForm from './pages/admin/dashboard/seats/SeatForm'
import ShowtimeList from './pages/admin/dashboard/showtimes/ShowtimeList'
import ShowtimeForm from './pages/admin/dashboard/showtimes/ShowtimeForm'
import Analytics from './pages/admin/dashboard/analytics/Analytics'
import Reports from './pages/admin/dashboard/analytics/Reports'
import UsersList from './pages/admin/dashboard/users/UsersList'
import UserForm from './pages/admin/dashboard/users/UserForm'
import Preferences from './pages/admin/dashboard/preferences/Preferences'
import Overview from './pages/admin/dashboard/overview/Overview'
import StaffDashboard from './staff/Dashboard'
import StaffCheckIn from './staff/CheckIn'
import StaffSearchTicket from './staff/SearchTicket'
import StaffTicketDetails from './staff/TicketDetails'

function AdminRoute({ children }) {
  return (
    <RequireRole role="admin">
      <AdminLayout>{children}</AdminLayout>
    </RequireRole>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Service />} />
            <Route path="/showtimes" element={<Navigate to="/services" replace />} />
            <Route path="/now-showing" element={<NowShowing />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/cinemas" element={<Cinemas />} />
            <Route path="/promotions" element={<Promotion />} />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/booking/:movieTitle"
              element={
                <RequireAuth>
                  <Booking />
                </RequireAuth>
              }
            />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/watch/:movieTitle" element={<Watch />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><Overview /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/admin/movies" element={<AdminRoute><MovieList /></AdminRoute>} />
        <Route path="/admin/movies/create" element={<AdminRoute><MovieCreate /></AdminRoute>} />
        <Route path="/admin/movies/:id/edit" element={<AdminRoute><MovieEdit /></AdminRoute>} />
        <Route path="/admin/cinemas" element={<AdminRoute><CinemaList /></AdminRoute>} />
        <Route path="/admin/cinemas/create" element={<AdminRoute><CinemaForm /></AdminRoute>} />
        <Route path="/admin/cinemas/:id/edit" element={<AdminRoute><CinemaForm isEdit /></AdminRoute>} />
        <Route path="/admin/rooms" element={<AdminRoute><RoomList /></AdminRoute>} />
        <Route path="/admin/rooms/create" element={<AdminRoute><RoomForm /></AdminRoute>} />
        <Route path="/admin/rooms/:id/edit" element={<AdminRoute><RoomForm isEdit /></AdminRoute>} />
        <Route path="/admin/seats" element={<AdminRoute><SeatList /></AdminRoute>} />
        <Route path="/admin/seats/create" element={<AdminRoute><SeatForm /></AdminRoute>} />
        <Route path="/admin/seats/:id/edit" element={<AdminRoute><SeatForm isEdit /></AdminRoute>} />
        <Route path="/admin/showtimes" element={<AdminRoute><ShowtimeList /></AdminRoute>} />
        <Route path="/admin/showtimes/create" element={<AdminRoute><ShowtimeForm /></AdminRoute>} />
        <Route path="/admin/showtimes/:id/edit" element={<AdminRoute><ShowtimeForm isEdit /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><CategoriesList /></AdminRoute>} />
        <Route path="/admin/categories/create" element={<AdminRoute><CategoriesForm /></AdminRoute>} />
        <Route path="/admin/categories/:id/edit" element={<AdminRoute><CategoriesForm isEdit /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><BookingList /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />
        <Route path="/admin/users/create" element={<AdminRoute><UserForm /></AdminRoute>} />
        <Route path="/admin/users/:id/edit" element={<AdminRoute><UserForm isEdit /></AdminRoute>} />
        <Route path="/admin/preferences" element={<AdminRoute><Preferences /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><Profile embedded /></AdminRoute>} />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={<StaffLayout><StaffDashboard /></StaffLayout>} />
        <Route path="/staff/bookings" element={<StaffLayout><StaffTicketDetails /></StaffLayout>} />
        <Route path="/staff/search" element={<StaffLayout><StaffSearchTicket /></StaffLayout>} />
        <Route path="/staff/checkin" element={<StaffLayout><StaffCheckIn /></StaffLayout>} />
        <Route path="/staff/customers" element={<StaffLayout><StaffTicketDetails /></StaffLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
