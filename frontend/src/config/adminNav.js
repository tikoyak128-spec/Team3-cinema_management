import {
  Armchair,
  Building2,
  ChartColumn,
  CircleUser,
  Clapperboard,
  ClipboardList,
  Clock,
  Compass,
  DoorOpen,
  FolderOpen,
  Palette,
  Settings,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

export const adminNavSections = [
  {
    label: "Overview",
    labelKey: "admin.overview",
    icon: Compass,
    items: [
      {
        name: "Dashboard",
        nameKey: "admin.dashboard",
        icon: ChartColumn,
        path: "/admin/dashboard",
      },
      {
        name: "Analytics",
        nameKey: "admin.analytics",
        icon: TrendingUp,
        path: "/admin/analytics",
      },
    ],
  },
  {
    label: "Management",
    labelKey: "admin.management",
    icon: FolderOpen,
    items: [
      {
        name: "Movies",
        nameKey: "admin.movies",
        icon: Clapperboard,
        path: "/admin/movies",
      },
      {
        name: "Cinemas",
        nameKey: "admin.cinemas",
        icon: Building2,
        path: "/admin/cinemas",
      },
      {
        name: "Rooms",
        nameKey: "admin.rooms",
        icon: DoorOpen,
        path: "/admin/rooms",
      },
      {
        name: "Seats",
        nameKey: "admin.seats",
        icon: Armchair,
        path: "/admin/seats",
      },
      {
        name: "Showtimes",
        nameKey: "admin.showtimes",
        icon: Clock,
        path: "/admin/showtimes",
      },
      {
        name: "Categories",
        nameKey: "admin.categories",
        icon: Tag,
        path: "/admin/categories",
      },
    ],
  },
  {
    label: "Operations",
    labelKey: "admin.operations",
    icon: Settings,
    items: [
      {
        name: "Bookings",
        nameKey: "admin.bookings",
        icon: Ticket,
        path: "/admin/bookings",
      },
      {
        name: "Reports",
        nameKey: "admin.reports",
        icon: ClipboardList,
        path: "/admin/reports",
      },
    ],
  },
  {
    label: "Settings",
    labelKey: "admin.settings",
    icon: Wrench,
    items: [
      {
        name: "Users",
        nameKey: "admin.users",
        icon: Users,
        path: "/admin/users",
      },
      {
        name: "Preferences",
        nameKey: "admin.preferences",
        icon: Palette,
        path: "/admin/preferences",
      },
      {
        name: "Profile",
        nameKey: "admin.myProfile",
        icon: CircleUser,
        path: "/admin/profile",
      },
    ],
  },
];