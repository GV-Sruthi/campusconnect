import { Link } from "react-router-dom"

function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-pink-500">
          CampusConnect
        </h1>

        <div className="space-x-4">
          <Link to="/login">
            <button className="px-4 py-2 rounded-lg bg-zinc-800">
              Login
            </button>
          </Link>

          <Link to="/register">
                <button className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600">
                    Register
                </button>
           </Link>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center text-center py-32 px-6">

        <h1 className="text-6xl font-bold">
          Connect with your campus community
        </h1>

        <p className="mt-6 text-zinc-400 text-lg max-w-2xl">
          Collaborate with classmates, share study material, and stay on top of campus alerts.
        </p>

      </div>

    </div>
  )
}

export default Home
