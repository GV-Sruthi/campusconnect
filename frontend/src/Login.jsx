function Login() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">

      <div className="bg-zinc-900 p-10 rounded-2xl w-[400px] shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center">
          Welcome Back
        </h1>

        <p className="text-zinc-400 text-center mt-2">
          Login to continue
        </p>

        <div className="mt-8 space-y-5">

          <input
            type="email"
            placeholder="Enter email"
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-3 rounded-xl bg-zinc-800 text-white outline-none"
          />

          <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold">
            Login
          </button>

        </div>

      </div>

    </div>
  )
}

export default Login