import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  Shield,
  UserCheck,
  UserX,
  Building2,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AgencyUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    organization: "",
    fullname: "",
    email: "",
    phone: "",
    location: "",
    role: "Field Officer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // DEMO DATA
      const demoUsers = [
        {
          id: 1,
          organization: "NESREA",
          fullname: "Daniel Green",
          email: "daniel@nesrea.gov.ng",
          phone: "+234 801 555 2211",
          location: "Port Harcourt",
          role: "Control Officer",
          status: "Active",
        },
        {
          id: 2,
          organization: "NEMA",
          fullname: "Grace Williams",
          email: "grace@nema.gov.ng",
          phone: "+234 803 222 1100",
          location: "Bonny Island",
          role: "Emergency Response",
          status: "Active",
        },
        {
          id: 3,
          organization: "Fire Service",
          fullname: "Michael Briggs",
          email: "michael@fireservice.ng",
          phone: "+234 805 888 9922",
          location: "Eleme",
          role: "Field Officer",
          status: "Suspended",
        },
      ];

      setUsers(demoUsers);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const addUser = () => {
    const newUser = {
      id: Date.now(),
      ...form,
      status: "Active",
    };

    setUsers((prev) => [newUser, ...prev]);

    setForm({
      organization: "",
      fullname: "",
      email: "",
      phone: "",
      location: "",
      role: "Field Officer",
    });

    setShowModal(false);
  };

  const suspendUser = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "Suspended" } : u
      )
    );
  };

  const activateUser = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: "Active" } : u
      )
    );
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(search.toLowerCase()) ||
      user.organization.toLowerCase().includes(search.toLowerCase()) ||
      user.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/AdminDashboard")}
            className="bg-white p-3 rounded-xl shadow hover:scale-105 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Agency Users Control Room
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Manage environmental agencies, emergency units and field officers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={18} />
          Add Agency User
        </button>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <h2 className="text-3xl font-bold mt-2">{users.length}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Active Officers</p>
          <h2 className="text-3xl font-bold mt-2 text-green-600">
            {users.filter((u) => u.status === "Active").length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Suspended</p>
          <h2 className="text-3xl font-bold mt-2 text-red-600">
            {users.filter((u) => u.status === "Suspended").length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-sm text-gray-500">Organizations</p>
          <h2 className="text-3xl font-bold mt-2 text-blue-600">
            {new Set(users.map((u) => u.organization)).size}
          </h2>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl shadow p-4 mb-8">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search agency users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* USERS LIST */}
      <div className="space-y-5">

        {loading ? (
          <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow text-center text-gray-500">
            No users found.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <div className="flex flex-col lg:flex-row lg:justify-between gap-6">

                {/* LEFT */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-3 mb-4">

                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Building2 size={14} />
                      {user.organization}
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {user.fullname}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">

                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" />
                      {user.email}
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-green-500" />
                      {user.phone}
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-red-500" />
                      {user.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-orange-500" />
                      {user.role}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col gap-3 min-w-55">

                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Eye size={16} />
                    View Profile
                  </button>

                  {user.status === "Active" ? (
                    <button
                      onClick={() => suspendUser(user.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <UserX size={16} />
                      Suspend User
                    </button>
                  ) : (
                    <button
                      onClick={() => activateUser(user.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                    >
                      <UserCheck size={16} />
                      Activate User
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Trash2 size={16} />
                    Remove User
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl">

            <h2 className="text-2xl font-bold mb-6">
              Add New Agency User
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <input
                type="text"
                placeholder="Organization"
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Full Name"
                value={form.fullname}
                onChange={(e) =>
                  setForm({ ...form, fullname: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>Field Officer</option>
                <option>Control Officer</option>
                <option>Emergency Response</option>
                <option>Supervisor</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-8">

              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>

              <button
                onClick={addUser}
                className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
