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
import MovieDetail from './pages/MovieDetail'
import Cinemas from './pages/Cinemas'
import Promotion from './pages/Promotion'
import Profile from './pages/Profile'
import MyBookings from './pages/MyBookings'
import Booking from './pages/Booking'
import Watch from './pages/Watch'
import BookingList from './pages/admin/dashboard/bookings/BookingList'
import PaymentsList from './pages/admin/dashboard/payments/PaymentsList'
import ReviewsList from './pages/admin/dashboard/reviews/ReviewsList'
import ContactsList from './pages/admin/dashboard/contacts/ContactsList'
import HeroesList from './pages/admin/dashboard/heroes/HeroesList'
import TeamList from './pages/admin/dashboard/team/TeamList'
import TeamForm from './pages/admin/dashboard/team/TeamForm'
import DiscountsList from './pages/admin/dashboard/discounts/DiscountsList'
import DiscountForm from './pages/admin/dashboard/discounts/DiscountForm'
import GalleryList from './pages/admin/dashboard/gallery/GalleryList'
import GalleryForm from './pages/admin/dashboard/gallery/GalleryForm'
import CategoriesList from './pages/admin/dashboard/categories/CategoriesList'
import CategoriesForm from './pages/admin/dashboard/categories/CategoriesForm'
import CinemaList from './pages/admin/dashboard/cinemas/CinemaList'
import CinemaForm from './pages/admin/dashboard/cinemas/CinemaForm'
import MovieList from './pages/admin/dashboard/movies/MovieList'
import MovieCreate from './pages/admin/dashboard/movies/MovieCreate'
import ComingSoonList from './pages/admin/dashboard/movies/ComingSoonList'
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
import Overview from './pages/admin/dashboard/overview/Overview'
import StaffDashboard from './staff/Dashboard'
import StaffSellTicket from './staff/SellTicket'
import StaffSearchTicket from './staff/SearchTicket'
import StaffCheckIn from './staff/CheckIn'
import StaffTickets from './staff/Tickets'

function AdminRoute({ children }) {
  return (
    <RequireRole role="admin">
      <AdminLayout>{children}</AdminLayout>
    </RequireRole>
  )
}

function StaffRoute({ children }) {
  return (
    <RequireRole role="staff">
      <StaffLayout>{children}</StaffLayout>
    </RequireRole>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Service />} />
            <Route path="/showtimes" element={<Navigate to="/services" replace />} />
            <Route path="/now-showing" element={<NowShowing />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/movies/:title" element={<MovieDetail />} />
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
            <Route
              path="/my-bookings"
              element={
                <RequireAuth>
                  <MyBookings />
                </RequireAuth>
              }
            />
            <Route path="/watch/:movieTitle" element={<Watch />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><Overview /></AdminRoute>} />
        <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="/admin/movies" element={<AdminRoute><MovieList /></AdminRoute>} />
        <Route path="/admin/movies/create" element={<AdminRoute><MovieCreate /></AdminRoute>} />
        <Route path="/admin/coming-soon" element={<AdminRoute><ComingSoonList /></AdminRoute>} />
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
        <Route path="/admin/payments" element={<AdminRoute><PaymentsList /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><ReviewsList /></AdminRoute>} />
        <Route path="/admin/contacts" element={<AdminRoute><ContactsList /></AdminRoute>} />
        <Route path="/admin/heroes" element={<AdminRoute><HeroesList /></AdminRoute>} />
        <Route path="/admin/team" element={<AdminRoute><TeamList /></AdminRoute>} />
        <Route path="/admin/team/create" element={<AdminRoute><TeamForm /></AdminRoute>} />
        <Route path="/admin/team/:id/edit" element={<AdminRoute><TeamForm isEdit /></AdminRoute>} />
        <Route path="/admin/discounts" element={<AdminRoute><DiscountsList /></AdminRoute>} />
        <Route path="/admin/discounts/create" element={<AdminRoute><DiscountForm /></AdminRoute>} />
        <Route path="/admin/discounts/:id/edit" element={<AdminRoute><DiscountForm isEdit /></AdminRoute>} />
        <Route path="/admin/gallery" element={<AdminRoute><GalleryList /></AdminRoute>} />
        <Route path="/admin/gallery/create" element={<AdminRoute><GalleryForm /></AdminRoute>} />
        <Route path="/admin/gallery/:id/edit" element={<AdminRoute><GalleryForm isEdit /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersList /></AdminRoute>} />
        <Route path="/admin/users/create" element={<AdminRoute><UserForm /></AdminRoute>} />
        <Route path="/admin/users/:id/edit" element={<AdminRoute><UserForm isEdit /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><Profile embedded /></AdminRoute>} />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
        <Route path="/staff/sell" element={<StaffRoute><StaffSellTicket /></StaffRoute>} />
        <Route path="/staff/search" element={<StaffRoute><StaffSearchTicket /></StaffRoute>} />
        <Route path="/staff/checkin" element={<StaffRoute><StaffCheckIn /></StaffRoute>} />
        <Route path="/staff/bookings" element={<StaffRoute><BookingList /></StaffRoute>} />
        <Route path="/staff/tickets" element={<StaffRoute><StaffTickets /></StaffRoute>} />
        <Route path="/staff/profile" element={<StaffRoute><Profile embedded /></StaffRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
