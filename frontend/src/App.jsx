import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import AdminLayout from './layouts/AdminLayout'
import StaffLayout from './layouts/StaffLayout'
import Login from './login/Login'
import Register from './login/Register'
import ForgotPassword from './login/ForgotPassword'
import ResetPassword from './login/ResetPassword'
import VerifyOtp from './login/VerifyOtp'
import Home from './pages/Home'
import SectionPage from './pages/SectionPage'
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
import StaffDashboard from './staff/Dashboard'
import StaffCheckIn from './staff/CheckIn'
import StaffSearchTicket from './staff/SearchTicket'
import StaffTicketDetails from './staff/TicketDetails'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<SectionPage sections={["about"]} />} />
          <Route path="/showtimes" element={<SectionPage sections={["showtimes"]} />} />
          <Route path="/now-showing" element={<SectionPage sections={["now-showing"]} />} />
          <Route path="/coming-soon" element={<SectionPage sections={["coming-soon"]} />} />
          <Route path="/cinemas" element={<SectionPage sections={["slider", "cinemas"]} />} />
          <Route path="/promotions" element={<SectionPage sections={["promotions"]} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route
            path="/booking/:movieTitle"
            element={
              <RequireAuth>
                <Booking />
              </RequireAuth>
            }
          />
          <Route path="/watch/:movieTitle" element={<Watch />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminLayout><BookingList /></AdminLayout>} />
        <Route path="/admin/analytics" element={<AdminLayout><Analytics /></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
        <Route path="/admin/movies" element={<AdminLayout><MovieList /></AdminLayout>} />
        <Route path="/admin/movies/create" element={<AdminLayout><MovieCreate /></AdminLayout>} />
        <Route path="/admin/movies/:id/edit" element={<AdminLayout><MovieEdit /></AdminLayout>} />
        <Route path="/admin/cinemas" element={<AdminLayout><CinemaList /></AdminLayout>} />
        <Route path="/admin/cinemas/create" element={<AdminLayout><CinemaForm /></AdminLayout>} />
        <Route path="/admin/cinemas/:id/edit" element={<AdminLayout><CinemaForm isEdit /></AdminLayout>} />
        <Route path="/admin/rooms" element={<AdminLayout><RoomList /></AdminLayout>} />
        <Route path="/admin/rooms/create" element={<AdminLayout><RoomForm /></AdminLayout>} />
        <Route path="/admin/rooms/:id/edit" element={<AdminLayout><RoomForm isEdit /></AdminLayout>} />
        <Route path="/admin/seats" element={<AdminLayout><SeatList /></AdminLayout>} />
        <Route path="/admin/seats/create" element={<AdminLayout><SeatForm /></AdminLayout>} />
        <Route path="/admin/seats/:id/edit" element={<AdminLayout><SeatForm isEdit /></AdminLayout>} />
        <Route path="/admin/showtimes" element={<AdminLayout><ShowtimeList /></AdminLayout>} />
        <Route path="/admin/showtimes/create" element={<AdminLayout><ShowtimeForm /></AdminLayout>} />
        <Route path="/admin/showtimes/:id/edit" element={<AdminLayout><ShowtimeForm isEdit /></AdminLayout>} />
        <Route path="/admin/categories" element={<AdminLayout><CategoriesList /></AdminLayout>} />
        <Route path="/admin/categories/create" element={<AdminLayout><CategoriesForm /></AdminLayout>} />
        <Route path="/admin/categories/:id/edit" element={<AdminLayout><CategoriesForm isEdit /></AdminLayout>} />
        <Route path="/admin/bookings" element={<AdminLayout><BookingList /></AdminLayout>} />

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
