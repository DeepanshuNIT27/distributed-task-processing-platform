import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { userService } from "../services/user.service";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 SURGICAL STRIKE: Ref for hidden file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfile(data.user);
    } catch (error) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const form = e.target;

    const name = form.fullName.value;
    const email = form.email.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    const currentPassword = form.currentPassword.value;

    if (newPassword && newPassword !== confirmPassword) {
      return toast.error("New passwords do not match!");
    }
    if (newPassword && !currentPassword) {
      return toast.error("Enter current password to set a new one!");
    }

    try {
      const toastId = toast.loading("Updating profile...");
      const updateData = { name, email };

      if (newPassword) {
        updateData.newPassword = newPassword;
        updateData.currentPassword = currentPassword;
      }

      await userService.updateProfile(updateData);
      toast.success("Profile updated successfully!", { id: toastId });

      form.currentPassword.value = "";
      form.newPassword.value = "";
      form.confirmPassword.value = "";
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  // 🔥 SURGICAL STRIKE: Logic to handle photo selection and conversion to Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image size must be less than 2MB");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const toastId = toast.loading("Updating photo...");
        await userService.updateProfile({ avatar: reader.result });
        toast.success("Photo updated successfully!", { id: toastId });
        fetchProfile();
      } catch (error) {
        toast.error("Failed to update photo");
      }
    };
  };

  // 🔥 SURGICAL STRIKE: Logic to permanently delete user account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const toastId = toast.loading("Deleting account...");
      await userService.deleteAccount();
      toast.success("Account deleted successfully!", { id: toastId });

      // Clear storage and redirect
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-slate-400">
        <Loader2 className="animate-spin text-[#7C3AED] mb-4" size={32} />
        Loading Profile...
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Profile / Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Information */}
        <div className="space-y-8">
          <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-200 mb-6 bg-[#7C3AED]/10 text-[#A855F7] w-max px-3 py-1 rounded-full">
              Profile Information
            </h3>
            <div className="flex flex-col items-center text-center">
              {/* 🔥 SURGICAL STRIKE: Display selected Avatar or Default Initial */}
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover shadow-lg mb-4 ring-4 ring-[#11151c] outline outline-1 outline-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#7C3AED] to-blue-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 ring-4 ring-[#11151c] outline outline-1 outline-slate-700">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <h4 className="text-lg font-bold text-white">
                {profile?.name || "User Name"}
              </h4>
              <p className="text-sm text-slate-400 mb-6">
                {profile?.email || "email@example.com"}
              </p>

              {/* 🔥 SURGICAL STRIKE: Hidden input and triggered button */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors border border-slate-700"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Account Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#11151c] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-slate-200 mb-6">
              Account Settings
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    defaultValue={profile?.name || ""}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={profile?.email || ""}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>
                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-8 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-[#7C3AED]/20"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#11151c] border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-red-400 mb-2">
              Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-slate-200 font-medium text-sm">
                  Delete Account
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
              </div>

              {/* 🔥 SURGICAL STRIKE: Connected button to handleDeleteAccount */}
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 py-2.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
