import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email requis";
    if (!formData.password) newErrors.password = "Mot de passe requis";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      console.log(formData);
      navigate("/dashboard/super-admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#F8F9F8] to-[#EEF3EF] p-6">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">

        <div className="p-8">

          {/* Logo */}

          <div className="flex flex-col items-center">

            <div className="w-14 h-14 rounded-2xl bg-[#2F6B4F] flex items-center justify-center text-white text-2xl shadow">
              ☕
            </div>

            <h1 className="text-3xl font-bold mt-4">
              <span className="text-gray-900">Future</span>
              <span className="text-[#2F6B4F]">Kawa</span>
            </h1>

            <p className="text-gray-500 text-sm mt-2 text-center">
              Plateforme de supervision du café vert
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 mt-8"
          >

            {/* Email */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>

              <div className="relative">

                <MdEmail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F6B4F]"
                  size={20}
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="prenom.nom@futurekawa.com"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition outline-none ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#2F6B4F] focus:ring-2 focus:ring-green-100"
                  }`}
                />

              </div>

              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}

            </div>

            {/* Password */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>

              <div className="relative">

                <RiLockPasswordFill
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F6B4F]"
                  size={18}
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  className={`w-full pl-12 pr-12 py-3 rounded-xl border transition outline-none ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#2F6B4F] focus:ring-2 focus:ring-green-100"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}

            </div>

            {/* Remember */}

            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-gray-600">

                <input
                  type="checkbox"
                  className="accent-[#2F6B4F]"
                />

                Se souvenir de moi

              </label>

              <button
                type="button"
                className="text-[#2F6B4F] hover:underline"
              >
                Mot de passe oublié ?
              </button>

            </div>

            {/* Bouton */}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#275A43] text-white font-semibold transition"
            >
              Se connecter
            </button>

          </form>

        </div>

        {/* Footer */}

        <div className="border-t border-gray-200 bg-gray-50 px-8 py-5">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">

              <ShieldCheck
                size={20}
                className="text-[#2F6B4F]"
              />

            </div>

            <div>

              <p className="font-medium text-gray-700">
                Connexion sécurisée
              </p>

              <p className="text-xs text-gray-500">
                Vos données sont protégées et confidentielles.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
} 

export default Login;